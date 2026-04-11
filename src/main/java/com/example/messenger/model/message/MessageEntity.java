package com.example.messenger.model.message;

import com.example.messenger.model.conversation.ConversationEntity;
import com.example.messenger.model.user.UserEntity;
import jakarta.persistence.*;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "messages")
public class MessageEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private boolean isCallInfo;
    private boolean isAnswered;
    private boolean isEnded;
    private Long duration;
    private boolean isAudioMessage;
    private String audioMessage;
    private String messageText;
    private String messageImageUrl;
    private Date editedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    public UserEntity sender;


    @ManyToMany
    @JoinTable(
            name = "message_seen_users",
            joinColumns = {@JoinColumn(name="message_id")},
            inverseJoinColumns = {@JoinColumn(name="user_id")}
    )
    private Set<UserEntity> seenUsers = new HashSet<>();
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private ConversationEntity conversation;
    public MessageEntity(){}
    public MessageEntity(String messageText, UserEntity sender, ConversationEntity conversation) {
        this.messageText = messageText;
        this.sender = sender;
        this.conversation = conversation;
        this.editedAt = new Date();
    }

    public Long getId() {
        return id;
    }

    public boolean isCallInfo() {
        return isCallInfo;
    }

    public boolean isAnswered() {
        return isAnswered;
    }

    public boolean isEnded() {
        return isEnded;
    }

    public Long getDuration() {
        return duration;
    }

    public boolean isAudioMessage() {
        return isAudioMessage;
    }

    public String getAudioMessage() {
        return audioMessage;
    }

    public String getMessageText() {
        return messageText;
    }

    public String getMessageImageUrl() {
        return messageImageUrl;
    }

    public Date getEditedAt() {
        return editedAt;
    }

    public UserEntity getSender() {
        return sender;
    }
    public ConversationEntity getConversation() { return conversation; }
    public Set<UserEntity> getSeenUsers() {
        return seenUsers;
    }
}
