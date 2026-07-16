package com.example.messenger.model;


public record ConversationWsMessage(
        ContactPreviewDto contact,
        ConversationAction action
) {
}
