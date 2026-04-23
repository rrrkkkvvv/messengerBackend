package com.example.messenger.model.user.request;

import jakarta.validation.constraints.NotNull;

public record RefreshAuthRequest (
        @NotNull
        String jwt
){
}
