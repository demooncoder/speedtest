package com.speedtest.pro.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpeedTestProgress {
    private String testId;
    private String testType;      // DOWNLOAD, UPLOAD, PING
    private Double currentSpeed;  // Current measured speed in Mbps
    private Double averageSpeed;  // Average speed so far
    private Integer progressPercent; // 0-100
    private String status;        // STARTED, IN_PROGRESS, COMPLETED
    private String message;       // Additional info
}
