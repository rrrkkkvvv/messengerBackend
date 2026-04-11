package com.example.messenger.model.user;

public record SignUpRequest(
        String email,
        String name,
        String password

) {
}
