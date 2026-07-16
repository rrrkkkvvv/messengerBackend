package com.example.messenger.service;

import com.example.messenger.exception.conversation.ConversationNotFoundException;
import com.example.messenger.exception.user.InvalidCredentialsException;
import com.example.messenger.exception.user.UserAccessDeniedException;
import com.example.messenger.exception.user.UserNotFoundException;
import com.example.messenger.mapper.ConversationMapper;
import com.example.messenger.mapper.UserMapper;
import com.example.messenger.model.*;
import com.example.messenger.model.conversation.*;
import com.example.messenger.model.message.Message;
import com.example.messenger.model.message.MessageEntity;
import com.example.messenger.model.user.UserEntity;
import com.example.messenger.repository.ConversationRepository;
import com.example.messenger.repository.MessageRepository;
import com.example.messenger.repository.UserRepository;
import com.example.messenger.websocket.OnlineUsersRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
 import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;


@Service
public class ConversationService {
    private static final Logger log = LoggerFactory.getLogger(ConversationService.class);
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final OnlineUsersRegistry onlineUsersRegistry;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final ConversationMapper conversationMapper;
    private final CloudinaryService cloudinaryService;
    private final WebSocketMessageService webSocketMessageService;

    public ConversationService(
            ConversationRepository conversationRepository,
            UserRepository userRepository,
            UserMapper userMapper,
            MessageRepository messageRepository,
            ConversationMapper conversationMapper,
            CloudinaryService cloudinaryService,
            OnlineUsersRegistry onlineUsersRegistry,
            WebSocketMessageService webSocketMessageService
     ) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.conversationRepository=conversationRepository;
        this.messageRepository =messageRepository;
        this.conversationMapper=conversationMapper;
        this.cloudinaryService=cloudinaryService;
        this.onlineUsersRegistry=onlineUsersRegistry;
        this.webSocketMessageService=webSocketMessageService;
    }

    public GetContactsResponse getContacts(Long id){
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
        Long[] onlineUserIds = onlineUsersRegistry.getOnlineUsers();
        return new GetContactsResponse(result,onlineUserIds) ;
    }


    public ConversationWithMessages getDirectConversation(Long currentUserId, Long userId){
        String key = String.valueOf(Math.min(currentUserId, userId))  + String.valueOf(Math.max(currentUserId, userId));
        Optional<ConversationEntity> conversationEntity = conversationRepository.findByKey(key);
        if(conversationEntity.isPresent()){
            UserEntity userEntity = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
            List<MessageEntity> messageEntities =  messageRepository.findByConversationId(conversationEntity.get().getId());
            UserContactPreviewDto contact = userMapper.mapUserWithConversation(userEntity, conversationEntity.get());
            List<Message> messages = conversationMapper.mapMessageEntities(messageEntities);
            return  new ConversationWithMessages(contact, messages);

        }else{
            UserEntity userEntity1 = userRepository.findById(currentUserId).orElseThrow(UserNotFoundException::new);
            UserEntity userEntity2 = userRepository.findById(userId).orElseThrow(UserNotFoundException::new);
            ConversationEntity conversation = new ConversationEntity();
            conversation.setIsGroup(false);
            conversation.setMembers(List.of(userEntity1,userEntity2));
            conversation.setConversationKey(key);
            ConversationEntity savedConversation = conversationRepository.save(conversation);
            UserContactPreviewDto contactForCreator = userMapper.mapUserWithConversation(userEntity2, savedConversation);
            UserContactPreviewDto contactForReciever = userMapper.mapUserWithConversation(userEntity1,savedConversation);
            webSocketMessageService.sendMessage("/topic/contacts/"+userEntity2.getId(), new ConversationWsMessage(contactForReciever, ConversationAction.CREATE));
            return  new ConversationWithMessages(contactForCreator, List.of());

        }
    }
    public void kickUser(Long conversationId,Long memberId, Long currentUserId){
         ConversationEntity conversationEntity = conversationRepository.findById(conversationId).orElseThrow(ConversationNotFoundException::new);

         if(!Objects.equals(conversationEntity.owner.getId(), currentUserId) || memberId.equals(currentUserId)){
            throw new UserAccessDeniedException();
         }
         List<UserEntity> members = conversationEntity.getMembers();
         members.removeIf(userEntity -> userEntity.getId().equals(memberId));
         conversationEntity.setMembers(members);
         conversationRepository.save(conversationEntity);
    }
    public void addUsers(Long conversationId,Long[] memberIds, Long currentUserId){
        ConversationEntity conversationEntity = conversationRepository.findById(conversationId).orElseThrow(ConversationNotFoundException::new);
        if(!Objects.equals(conversationEntity.owner.getId(), currentUserId) ){
            throw new UserAccessDeniedException();
        }
        List<UserEntity> memberEntities = new ArrayList<>();
        for (Long id : memberIds){
            memberEntities.add(userRepository.findById(id).orElseThrow(UserNotFoundException::new));
        }
        List<UserEntity> members = conversationEntity.getMembers();
        members.addAll(memberEntities);
        conversationEntity.setMembers(members);
        conversationRepository.save(conversationEntity);
    }
    public void leaveConversation(Long conversationId, Long currentUserId){
        ConversationEntity conversationEntity = conversationRepository.findById(conversationId).orElseThrow(ConversationNotFoundException::new);
        if(Objects.equals(conversationEntity.owner.getId(), currentUserId) ){
            throw new UserAccessDeniedException();
        }

        List<UserEntity> members = conversationEntity.getMembers();
        members.removeIf(userEntity -> userEntity.getId().equals(currentUserId));
        conversationEntity.setMembers(members);
        conversationRepository.save(conversationEntity);
    }
    public ConversationWithMessages createGroup(CreateGroupRequest groupInfo, Long ownerId){
        UserEntity owner = userRepository.findById(ownerId).orElseThrow(InvalidCredentialsException::new);
        List<UserEntity> members = new ArrayList<>(groupInfo.memberIds()
                .stream()
                .map(id -> userRepository.findById(id).orElseThrow(UserNotFoundException::new))
                .toList());
        members.add(owner);
        ConversationEntity conversationEntity = new ConversationEntity();
        conversationEntity.setName(groupInfo.name());
        conversationEntity.setIsGroup(true);
        conversationEntity.setMembers(members);
        conversationEntity.setOwner(owner);
        conversationRepository.save(conversationEntity);

        GroupContactPreviewDto contact = userMapper.mapGroup(conversationEntity);
        return new ConversationWithMessages(contact, List.of());
    }
    public ConversationWithMessages getGroup(Long conversationId, Long currentUserId){
        ConversationEntity conversation = conversationRepository.findById(conversationId).orElseThrow(ConversationNotFoundException::new);
        boolean isMember = false;
        for (UserEntity user : conversation.getMembers()){
            if (user.getId().equals(currentUserId)) {
                isMember = true;
                break;
            }
        }
        if(!isMember){
            throw new UserAccessDeniedException();
        }

        GroupContactPreviewDto contact = userMapper.mapGroup(conversation);
        List<MessageEntity> messageEntities =  messageRepository.findByConversationId(conversationId);
        List<Message> messages = conversationMapper.mapMessageEntities(messageEntities);
        return new ConversationWithMessages(contact, messages);

    }
    public GroupContactPreviewDto updateById(
            Long conversationId,
            Long currentUserId,
            String name,
            AvatarAction avatarAction,
            MultipartFile avatar
    ){
        ConversationEntity conversationEntity = conversationRepository.findById(conversationId).orElseThrow(ConversationNotFoundException::new);
        if(!conversationEntity.getOwner().getId().equals(currentUserId)){
            throw new UserAccessDeniedException();
        }
        if (name != null && !name.isBlank()) {
            conversationEntity.setName(name);
        }

        if (avatar != null && !avatar.isEmpty() && avatarAction.equals(AvatarAction.SET) ) {
            String avatarUrl = cloudinaryService.uploadFile(avatar, "folder_1");
            conversationEntity.setAvatarUrl(avatarUrl);
        }else if(avatarAction.equals(AvatarAction.REMOVE)){
            conversationEntity.setAvatarUrl(null);
        }

        conversationRepository.save(conversationEntity);

        return userMapper.mapGroup(conversationEntity);

    }
    public void deleteById(Long conversationId, Long currentUserId){
        ConversationEntity conversationEntity = conversationRepository.findById(conversationId).orElseThrow(ConversationNotFoundException::new);
        if(conversationEntity.isGroup()){
            if(!conversationEntity.owner.getId().equals(currentUserId)){
                throw new UserAccessDeniedException();
            }
            conversationRepository.deleteById(conversationId);

        }else{
            if(conversationEntity.members.stream().noneMatch(u ->u.getId().equals(currentUserId) )){
                throw new UserAccessDeniedException();
            };
            conversationRepository.deleteById(conversationId);

        }
    }
}
