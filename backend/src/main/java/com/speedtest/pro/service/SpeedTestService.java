package com.speedtest.pro.service;

import com.speedtest.pro.dto.SpeedTestProgress;
import com.speedtest.pro.dto.SpeedTestResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class SpeedTestService {

    private final SimpMessagingTemplate messagingTemplate;
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Generate random data for download speed test
     */
    public byte[] generateTestData(int sizeInMB) {
        int sizeInBytes = sizeInMB * 1024 * 1024;
        byte[] data = new byte[sizeInBytes];
        RANDOM.nextBytes(data);
        log.info("Generated {} MB of random test data", sizeInMB);
        return data;
    }

    /**
     * Proxy download from Cloudflare - streams data from Cloudflare to client
     * This provides accurate internet speed measurement while backend acts as proxy
     */
    public void streamCloudflareData(int sizeInMB, OutputStream outputStream) throws IOException {
        int sizeInBytes = sizeInMB * 1024 * 1024;
        String cloudflareUrl = "https://speed.cloudflare.com/__down?bytes=" + sizeInBytes;

        log.info("Proxying download from Cloudflare - Size: {} MB", sizeInMB);

        try {
            URL url = new URL(cloudflareUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(30000);

            int responseCode = connection.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                try (InputStream inputStream = connection.getInputStream()) {
                    byte[] buffer = new byte[8192]; // 8KB buffer
                    int bytesRead;
                    long totalBytesRead = 0;

                    while ((bytesRead = inputStream.read(buffer)) != -1) {
                        outputStream.write(buffer, 0, bytesRead);
                        outputStream.flush();
                        totalBytesRead += bytesRead;
                    }

                    log.info("Streamed {} bytes from Cloudflare", totalBytesRead);
                }
            } else {
                log.error("Cloudflare returned status code: {}", responseCode);
                throw new IOException("Failed to fetch from Cloudflare: HTTP " + responseCode);
            }
        } catch (Exception e) {
            log.error("Error streaming from Cloudflare", e);
            throw new IOException("Error streaming from Cloudflare: " + e.getMessage(), e);
        }
    }

    /**
     * Measure upload speed from received file
     */
    public SpeedTestResult measureUploadSpeed(String testId, MultipartFile file, long uploadTimeMs) {
        try {
            long fileSizeBytes = file.getSize();
            double fileSizeMB = fileSizeBytes / (1024.0 * 1024.0);
            double uploadTimeSeconds = uploadTimeMs / 1000.0;

            // Calculate speed in Mbps
            double uploadSpeedMbps = (fileSizeMB * 8) / uploadTimeSeconds;

            log.info("Upload test completed - Size: {} MB, Time: {} seconds, Speed: {} Mbps",
                    String.format("%.2f", fileSizeMB),
                    String.format("%.2f", uploadTimeSeconds),
                    String.format("%.2f", uploadSpeedMbps));

            return SpeedTestResult.builder()
                    .testId(testId)
                    .uploadSpeed(uploadSpeedMbps)
                    .timestamp(LocalDateTime.now())
                    .status("COMPLETED")
                    .serverLocation("Local Server")
                    .build();
        } catch (Exception e) {
            log.error("Error measuring upload speed", e);
            return SpeedTestResult.builder()
                    .testId(testId)
                    .status("FAILED")
                    .timestamp(LocalDateTime.now())
                    .build();
        }
    }

    /**
     * Simulate ping/latency measurement
     */
    public SpeedTestResult measurePing(String testId) {
        try {
            List<Long> pingTimes = new ArrayList<>();

            // Simulate 10 ping measurements
            for (int i = 0; i < 10; i++) {
                long pingTime = simulatePing();
                pingTimes.add(pingTime);

                // Send progress update via WebSocket
                sendProgress(testId, "PING", null, (i + 1) * 10, "Measuring ping...");

                Thread.sleep(50); // Small delay between pings
            }

            // Calculate average ping
            double avgPing = pingTimes.stream()
                    .mapToLong(Long::longValue)
                    .average()
                    .orElse(0.0);

            // Calculate jitter (standard deviation)
            double jitter = calculateJitter(pingTimes, avgPing);

            log.info("Ping test completed - Avg: {} ms, Jitter: {} ms",
                    String.format("%.2f", avgPing),
                    String.format("%.2f", jitter));

            return SpeedTestResult.builder()
                    .testId(testId)
                    .ping(avgPing)
                    .jitter(jitter)
                    .timestamp(LocalDateTime.now())
                    .status("COMPLETED")
                    .serverLocation("Local Server")
                    .build();
        } catch (Exception e) {
            log.error("Error measuring ping", e);
            return SpeedTestResult.builder()
                    .testId(testId)
                    .status("FAILED")
                    .timestamp(LocalDateTime.now())
                    .build();
        }
    }

    /**
     * Generate unique test ID
     */
    public String generateTestId() {
        return UUID.randomUUID().toString();
    }

    /**
     * Send progress update via WebSocket
     */
    public void sendProgress(String testId, String testType, Double speed, Integer percent, String message) {
        SpeedTestProgress progress = SpeedTestProgress.builder()
                .testId(testId)
                .testType(testType)
                .currentSpeed(speed)
                .progressPercent(percent)
                .status(percent >= 100 ? "COMPLETED" : "IN_PROGRESS")
                .message(message)
                .build();

        messagingTemplate.convertAndSend("/topic/speedtest/" + testId, progress);
    }

    /**
     * Simulate ping measurement (in production, this would be actual network measurement)
     */
    private long simulatePing() {
        // Simulate realistic ping times between 5ms to 50ms
        return 5 + RANDOM.nextInt(45);
    }

    /**
     * Calculate jitter (standard deviation of ping times)
     */
    private double calculateJitter(List<Long> pingTimes, double avgPing) {
        double variance = pingTimes.stream()
                .mapToDouble(ping -> Math.pow(ping - avgPing, 2))
                .average()
                .orElse(0.0);

        return Math.sqrt(variance);
    }
}
