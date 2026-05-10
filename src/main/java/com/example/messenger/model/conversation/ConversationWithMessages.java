package com.example.messenger.model.conversation;

import com.example.messenger.model.ContactPreviewDto;
import com.example.messenger.model.message.Message;

import java.util.List;

public record ConversationWithMessages(ContactPreviewDto conversationInfo, List<Message> messages) {
}
