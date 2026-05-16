package com.example.messenger.exception.conversation;

public class ConversationNotFoundException extends RuntimeException{
    public ConversationNotFoundException() {
        super("Conversation not found");
    }
}
