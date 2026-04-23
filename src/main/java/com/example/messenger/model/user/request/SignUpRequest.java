package com.example.messenger.model.user.request;

import com.example.messenger.util.PatternConstants;
import jakarta.validation.constraints.Pattern;

public record SignUpRequest(
        @Pattern(regexp = PatternConstants.EMAIL)
        String email,
        String name,
        String password
) {

}
