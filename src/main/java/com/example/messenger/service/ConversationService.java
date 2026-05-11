package com.example.messenger.service;

import com.example.messenger.exception.userExceptions.UserNotFoundException;
import com.example.messenger.mapper.ConversationMapper;
import com.example.messenger.mapper.UserMapper;
import com.example.messenger.model.ContactPreviewDto;
import com.example.messenger.model.conversation.ConversationEntity;
import com.example.messenger.model.conversation.ConversationWithMessages;
import com.example.messenger.model.conversation.UserContactPreviewDto;
import com.example.messenger.model.message.Message;
import com.example.messenger.model.message.MessageEntity;
import com.example.messenger.model.user.UserEntity;
import com.example.messenger.repository.ConversationRepository;
import com.example.messenger.repository.MessageRepository;
import com.example.messenger.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
 import org.springframework.stereotype.Service;

import java.util.*;


@Service
public class ConversationService {
    private static final Logger log = LoggerFactory.getLogger(ConversationService.class);
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageReporitory;

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ConversationMapper conversationMapper;


    public ConversationService(
            ConversationRepository conversationRepository,
            UserRepository userRepository,
            UserMapper userMapper,
            MessageRepository messageReporitory,
            ConversationMapper conversationMapper
     ) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.conversationRepository=conversationRepository;
        this.messageReporitory=messageReporitory;
        this.conversationMapper=conversationMapper;

    }
    public List<ContactPreviewDto> getContacts(Long id){
        List<ConversationEntity> conversations = conversationRepository.findAllByUserId(id);

        Map<Long, ConversationEntity> privateConversations = new HashMap<>();
        List<ConversationEntity> groupConversations = new ArrayList<>();

        for (ConversationEntity c : conversations) {
            if (c.isGroup()) {
                groupConversations.add(c);
            } else {
                for (UserEntity member : c.members) {
                    if (!member.getId().equals(id)) {
                        privateConversations.put(member.getId(), c);
                    }
                }
            }
        }
        List<UserEntity> users = userRepository.findAllExceptId(id);
        List<ContactPreviewDto > result = new ArrayList<>();
        for (ConversationEntity c : groupConversations) {
            result.add(userMapper.mapGroup(c));
        }
        for (UserEntity user : users) {

            ConversationEntity conversation = privateConversations.get(user.getId());
             if (conversation != null) {

                result.add(userMapper.mapUserWithConversation(user, conversation));
            } else {

                result.add(userMapper.mapUserWithoutConversation(user));
            }
        }
        return result;
    }
    public ConversationWithMessages getDirectConversation(Long currentUserId, Long userId){
        String key = String.valueOf(Math.min(currentUserId, userId))  + String.valueOf(Math.max(currentUserId, userId));
        Optional<ConversationEntity> conversationEntity = conversationRepository.findByKey(key);
        if(conversationEntity.isPresent()){
            log.info("present----------------");
            UserEntity userEntity = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
            List<MessageEntity> messageEntities =  messageReporitory.findByConversationId(conversationEntity.get().getId());
            UserContactPreviewDto contact = userMapper.mapUserWithConversation(userEntity, conversationEntity.get());
            List<Message> messages = conversationMapper.mapMessageEntities(messageEntities);
            return  new ConversationWithMessages(contact, messages);

        }else{
            log.info("new---------------------");

            UserEntity userEntity1 = userRepository.findById(currentUserId).orElseThrow(UserNotFoundException::new);
            UserEntity userEntity2 = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
            ConversationEntity conversation = new ConversationEntity();
            conversation.setIsGroup(false);
            conversation.setMembers(List.of(userEntity1,userEntity2));
            conversation.setConversationKey(key);
            ConversationEntity saved = conversationRepository.save(conversation);
            UserContactPreviewDto contact = userMapper.mapUserWithConversation(userEntity2, saved);
            return  new ConversationWithMessages(contact, List.of());
        }
    }
}
