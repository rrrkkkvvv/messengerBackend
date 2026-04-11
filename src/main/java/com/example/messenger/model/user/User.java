package com.example.messenger.model.user;

import jakarta.annotation.Nullable;
 import jakarta.validation.constraints.NotNull;

public record User(
        @NotNull
        Long id,
        @NotNull
        String email,
        @NotNull
        String name,
        @Nullable
        String avatarUrl

) {
}
