package com.example.messenger.model.conversation;


import com.example.messenger.model.ContactPreviewDto;

import com.example.messenger.model.message.MessageEntity;
import com.example.messenger.model.user.User;

import java.util.List;

public class GroupContactPreviewDto implements ContactPreviewDto {
    private final String type ="group";

    private Long id;
    private String name;
    private User owner;
    private List<User> members;
    private String avatarUrl;
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
    public void setOwner(User owner) {
        this.owner = owner;
    }
    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
    public void setMembers(List<User> members) {
        this.members = members;
    }


    public void setLastMessage(MessageEntity lastMessage) {
        this.lastMessage = lastMessage;
    }
}
