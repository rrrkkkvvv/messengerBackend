package com.example.messenger.controller;

import com.example.messenger.model.message.Message;
import com.example.messenger.model.message.TestMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class MessageController {
    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public TestMessage greeting(TestMessage message) throws Exception {

        return new TestMessage("Response");
    }
    @PostMapping
    public ResponseEntity<Void> sendMessage(){
        return ResponseEntity.ok().build();
    }
}
