package com.example.messenger.mapper;

import com.example.messenger.controller.ConversationController;
import com.example.messenger.model.conversation.ConversationEntity;
import com.example.messenger.model.conversation.GroupContactPreviewDto;
import com.example.messenger.model.conversation.UserContactPreviewDto;
import com.example.messenger.model.user.User;
import com.example.messenger.model.user.UserEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
@Component
public  class UserMapper {
    private static final Logger log = LoggerFactory.getLogger(UserMapper.class);

    public User convertToDomain(UserEntity userEntity){
        return new User(
                userEntity.getId(),
                userEntity.getEmail(),
                userEntity.getName(),
                userEntity.getAvatarUrl()
        );
    }
    public UserContactPreviewDto mapUserWithConversation(UserEntity user, ConversationEntity conversation){

        UserContactPreviewDto dto = new UserContactPreviewDto();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setAvatarUrl(user.getAvatarUrl());

        dto.setConversationId(conversation.getId());
        dto.setLastMessage(
                conversation.getLastMessage()
        );
        return dto;

    }
    public UserContactPreviewDto mapUserWithoutConversation(UserEntity user){

        UserContactPreviewDto dto = new UserContactPreviewDto();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());

        dto.setAvatarUrl(user.getAvatarUrl());

        dto.setConversationId(null);
        dto.setLastMessage(null);
        log.info(dto.getId().toString());
        log.info(dto.getEmail());
        log.info(user.getEmail());


        return dto;

    }
    public GroupContactPreviewDto mapGroup( ConversationEntity conversation){

        GroupContactPreviewDto dto = new GroupContactPreviewDto();

        dto.setId(conversation.getId());
        dto.setName(conversation.getName());
        dto.setAvatarUrl(conversation.getAvatarUrl());

        dto.setMembers(conversation.getMembers().stream().map(this::convertToDomain).toList());
        dto.setOwner(convertToDomain(conversation.getOwner()));
        dto.setLastMessage(conversation.getLastMessage());
        return dto;

    }
}
