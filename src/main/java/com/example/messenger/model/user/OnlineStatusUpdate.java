package com.example.messenger.model.user;

public record OnlineStatusUpdate(
        Long userId,
        Boolean isOnline
) {
}
