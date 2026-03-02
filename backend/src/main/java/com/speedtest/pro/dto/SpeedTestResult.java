package com.speedtest.pro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeedTestResult {
    private String testId;
    private Double downloadSpeed; // in Mbps
    private Double uploadSpeed;   // in Mbps
    private Double ping;          // in ms
    private Double jitter;        // in ms
    private String serverLocation;
    private LocalDateTime timestamp;
    private String status;        // STARTED, IN_PROGRESS, COMPLETED, FAILED
}
