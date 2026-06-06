package com.example.messenger.model.message;

import com.example.messenger.model.conversation.ConversationEntity;
import com.example.messenger.model.user.UserEntity;
import jakarta.persistence.*;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;
//    INSERT INTO messages (conversation_id, sender_id, message_text, is_answered, is_audio_message, is_call_info, is_ended) VALUES (7, 3, 'TExt 123', false, false, false, false);

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
    private Date sentAt;
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

    public boolean getIsCallInfo() {
        return isCallInfo;
    }

    public boolean getIsAnswered() {
        return isAnswered;
    }

    public boolean getIsEnded() {
        return isEnded;
    }

    public Long getDuration() {
        return duration;
    }

    public boolean getIsAudioMessage() {
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

    public Date getSentAt() {
        return sentAt;
    }

    public void setSentAt(Date sentAt) {
        this.sentAt = sentAt;
    }

    public UserEntity getSender() {
        return sender;
    }
    public ConversationEntity getConversation() { return conversation; }
    public Set<UserEntity> getSeenUsers() {
        return seenUsers;
    }
}
