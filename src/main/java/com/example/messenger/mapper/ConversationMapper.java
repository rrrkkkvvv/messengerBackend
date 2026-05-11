package com.example.messenger.mapper;

import com.example.messenger.model.conversation.ConversationEntity;
import com.example.messenger.model.conversation.ConversationWithMessages;
import com.example.messenger.model.message.Message;
import com.example.messenger.model.message.MessageEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ConversationMapper {
    private static final Logger log = LoggerFactory.getLogger(ConversationMapper.class);

    public List<Message> mapMessageEntities(List<MessageEntity> messageEntities){
        return messageEntities.stream().map(m -> new Message(
                m.getId(),
                m.getIsCallInfo(),
                m.getIsAnswered(),
                m.getIsEnded(),
                m.getDuration(),
                m.getIsAudioMessage(),
                m.getAudioMessage(),
                m.getMessageText(),
                m.getMessageImageUrl(),
                m.getEditedAt(),
                m.getSentAt(),
                m.getSeenUsers()
        )).toList();
    }
}
