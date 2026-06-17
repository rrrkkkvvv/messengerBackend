package com.example.messenger.service;

import org.springframework.stereotype.Service;

@Service
public class ContactNotificationService {
    private final WebSocketMessageService webSocketMessageService;
    public ContactNotificationService(WebSocketMessageService webSocketMessageService){

        this.webSocketMessageService = webSocketMessageService;
    }
    public void sendUserOnlineStatus(){}
}
