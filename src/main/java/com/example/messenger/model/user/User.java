package com.example.messenger.model.user;

import com.example.messenger.util.PatternConstants;
import jakarta.annotation.Nullable;
 import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

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
