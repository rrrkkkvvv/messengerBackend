package com.example.messenger.model.conversation;

import com.example.messenger.model.ContactPreviewDto;
import com.example.messenger.model.message.MessageEntity;

public class UserContactPreviewDto implements ContactPreviewDto {
    private final String type ="single";

    private Long id;
    private String name;
    private String email;
    private String avatarUrl;
    private Long conversationId;
    private MessageEntity lastMessage;
    @Override
    public String getType() {
        return type;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public void setLastMessage(MessageEntity lastMessage) {
        this.lastMessage = lastMessage;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public MessageEntity getLastMessage() {
        return lastMessage;
    }
}
