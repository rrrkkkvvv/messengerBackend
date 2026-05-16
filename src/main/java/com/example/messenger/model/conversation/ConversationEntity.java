package com.example.messenger.model.conversation;

import com.example.messenger.model.message.MessageEntity;
import com.example.messenger.model.user.UserEntity;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "conversations")
public class ConversationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean isGroup;
    private String name;

    private String avatarUrl;
    private String conversationKey;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    public UserEntity owner;

    @ManyToMany
    @JoinTable(
            name = "conversation_members",
            joinColumns = @JoinColumn(name = "conversation_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    public List<UserEntity> members;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_message_id")
    private MessageEntity lastMessage;


    public Long getId() { return id; }
    public MessageEntity getLastMessage() { return lastMessage; }
    public void setLastMessage(MessageEntity message) { this.lastMessage = message; }

    public void setName(String name) {
        this.name = name;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public void setOwner(UserEntity owner) {
        this.owner = owner;
    }

    public boolean isGroup() {
        return isGroup;
    }

    public String getName() {
        return name;
    }

    public UserEntity getOwner() {
        return owner;
    }

    public List<UserEntity> getMembers() {
        return members;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setIsGroup(boolean isGroup) {
        this.isGroup = isGroup;
    }

    public void setConversationKey(String conversationKey) {
        this.conversationKey = conversationKey;
    }

    public void setMembers(List<UserEntity> members) {
        this.members = members;
    }
}
