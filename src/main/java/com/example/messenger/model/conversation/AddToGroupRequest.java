package com.example.messenger.model.conversation;

import jakarta.validation.constraints.NotNull;

public record AddToGroupRequest(
        @NotNull
        Long[] memberIds
) {
}
