package com.example.messenger.controller;

import com.example.messenger.model.message.Message;
import com.example.messenger.model.message.MessageEntity;
import com.example.messenger.model.user.SignUpRequest;
import com.example.messenger.model.user.User;
import com.example.messenger.model.user.UserEntity;
import com.example.messenger.repository.MessageRepository;
import com.example.messenger.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/")
public class TestController {
    private static final Logger log = LoggerFactory.getLogger(TestController.class);
    final private UserRepository userRepository;
    final private MessageRepository messageRepository;

    public TestController(UserRepository userRepository, MessageRepository messageRepository){
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
    }
    @PostMapping("/addUser")
    public ResponseEntity<User> addUser(
            @RequestBody SignUpRequest request
            ){

        UserEntity userEntity = new UserEntity(
                request.email(),
                request.name(),
                null,
                null,
                null,
                request.password()
        );
        UserEntity savedUserEntity =userRepository.save(userEntity);
        User user = new User(
                savedUserEntity.getId(),
                savedUserEntity.getEmail(),
                savedUserEntity.getName(),
                savedUserEntity.getAvatarUrl()
        );

        log.info("user with that email was added to db: "+user.email());
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

    @PostMapping("/addMessage")
    public ResponseEntity<Message> addMessage(

    ){
        messageRepository.markSeen(1L,1L);

        Optional< MessageEntity> msgWithSeen = messageRepository.findWithSeenUsers(1L);
        if(msgWithSeen.isEmpty()){
            throw  new IllegalArgumentException();
        }


        Message message =  new Message(
                msgWithSeen.get().getId(),
                msgWithSeen.get().isCallInfo(),
                msgWithSeen.get().isAnswered(),
                msgWithSeen.get().isEnded(),
                msgWithSeen.get().getDuration(),
                msgWithSeen.get().isAudioMessage(),
                msgWithSeen.get().getAudioMessage(),
                msgWithSeen.get().getMessageText(),
                msgWithSeen.get().getMessageImageUrl(),
                msgWithSeen.get().getEditedAt(),
                msgWithSeen.get().getSeenUsers()

            );




        return ResponseEntity.status(HttpStatus.OK).body(message);

    }
}
