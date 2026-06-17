package com.example.messenger.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketMessageService {
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketMessageService(SimpMessagingTemplate messagingTemplate){
        this.messagingTemplate=messagingTemplate;
    }
    public <T> void sendMessage(String destination, T body){
        messagingTemplate.convertAndSend(destination, body);
    }
}
