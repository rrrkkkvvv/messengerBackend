package com.example.messenger.model.message;

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
    private String messageImage;
    private Date editedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id")
    public UserEntity sender;


    @ManyToMany(cascade = {CascadeType.ALL})
    @JoinTable(
            name = "message_seen_ids",
            joinColumns = {@JoinColumn(name="message_id")},
            inverseJoinColumns = {@JoinColumn(name="user_id")}
    )
    private Set<UserEntity> seenUsers = new HashSet<>();
    public MessageEntity(){}
    public MessageEntity(String messageText, UserEntity sender) {
        this.messageText = messageText;
        this.sender = sender;

    }
}
