package com.speedtest.pro.websocket;

import com.speedtest.pro.dto.SpeedTestProgress;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
public class WebSocketController {

    /**
     * Handle incoming messages from clients
     */
    @MessageMapping("/test-progress")
    @SendTo("/topic/speedtest")
    public SpeedTestProgress handleTestProgress(SpeedTestProgress progress) {
        log.debug("Received progress update: {}", progress);
        return progress;
    }
}
