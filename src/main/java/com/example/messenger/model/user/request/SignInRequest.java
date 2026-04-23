package com.example.messenger.model.user.request;

import com.example.messenger.util.PatternConstants;
import jakarta.validation.constraints.Pattern;

public record SignInRequest(
        @Pattern(regexp = PatternConstants.EMAIL)
        String email,
        String password
) {
}
