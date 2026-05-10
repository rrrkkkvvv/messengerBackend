package com.example.messenger.controller;

import com.example.messenger.model.message.TestMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class MessageController {
    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public TestMessage greeting(TestMessage message) throws Exception {

        return new TestMessage("Response");
    }
}
