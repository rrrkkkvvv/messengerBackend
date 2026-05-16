package com.example.messenger.model.conversation;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateGroupRequest(
        @NotNull
        String name,
        @NotNull
        List<Long> memberIds
) {
}
