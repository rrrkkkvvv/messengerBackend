package com.example.messenger.exception;

import java.time.LocalDateTime;

public class ErrorResponseDTO{
    public String message;
    public LocalDateTime errorTime;

    public ErrorResponseDTO(String message) {
        this.message = message;
        this.errorTime = LocalDateTime.now();
    }
}
