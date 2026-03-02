package com.speedtest.pro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SpeedTestProApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpeedTestProApplication.class, args);
        System.out.println("\n" +
                "╔═══════════════════════════════════════════════════════╗\n" +
                "║                                                       ║\n" +
                "║          SpeedTest Pro - Backend Started!            ║\n" +
                "║                                                       ║\n" +
                "║  Server running on: http://localhost:8080            ║\n" +
                "║  Health Check: http://localhost:8080/actuator/health ║\n" +
                "║                                                       ║\n" +
                "╚═══════════════════════════════════════════════════════╝\n");
    }
}
