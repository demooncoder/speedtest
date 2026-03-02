package com.speedtest.pro.controller;

import com.speedtest.pro.dto.SpeedTestResult;
import com.speedtest.pro.service.SpeedTestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/speedtest")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SpeedTestController {

    private final SpeedTestService speedTestService;

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "SpeedTest Pro API");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    /**
     * Generate test ID for new test session
     */
    @GetMapping("/generate-test-id")
    public ResponseEntity<Map<String, String>> generateTestId() {
        String testId = speedTestService.generateTestId();
        log.info("Generated new test ID: {}", testId);

        Map<String, String> response = new HashMap<>();
        response.put("testId", testId);
        return ResponseEntity.ok(response);
    }

    /**
     * Download endpoint - proxies data from Cloudflare for accurate speed test
     * Client measures time to download and calculates speed
     */
    @GetMapping("/download")
    public void downloadTest(
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String testId,
            HttpServletResponse response) throws IOException {

        log.info("Download test requested (Cloudflare proxy) - Size: {} MB, TestID: {}", size, testId);

        // Limit size to prevent abuse
        if (size > 100) {
            size = 100;
        }

        // Set response headers
        response.setContentType("application/octet-stream");
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");

        // Stream data from Cloudflare through backend to client
        try {
            speedTestService.streamCloudflareData(size, response.getOutputStream());
            response.getOutputStream().flush();
        } catch (IOException e) {
            log.error("Error streaming download data", e);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Download failed");
        }
    }

    /**
     * Upload endpoint - receives file and measures upload speed
     */
    @PostMapping("/upload")
    public ResponseEntity<SpeedTestResult> uploadTest(
            @RequestParam("file") MultipartFile file,
            @RequestParam("testId") String testId,
            @RequestParam("uploadTime") long uploadTimeMs) {

        log.info("Upload test received - TestID: {}, File size: {} bytes, Upload time: {} ms",
                testId, file.getSize(), uploadTimeMs);

        SpeedTestResult result = speedTestService.measureUploadSpeed(testId, file, uploadTimeMs);

        return ResponseEntity.ok(result);
    }

    /**
     * Ping/Latency test endpoint
     */
    @GetMapping("/ping")
    public ResponseEntity<SpeedTestResult> pingTest(@RequestParam String testId) {
        log.info("Ping test requested - TestID: {}", testId);

        SpeedTestResult result = speedTestService.measurePing(testId);

        return ResponseEntity.ok(result);
    }

    /**
     * Simple ping endpoint for latency measurement
     */
    @GetMapping("/ping-simple")
    public ResponseEntity<Map<String, Object>> pingSimple() {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "pong");
        return ResponseEntity.ok(response);
    }
}
