package com.example.messenger.controller;

import com.example.messenger.model.message.MessageEntity;
import com.example.messenger.model.user.CreateUser;
import com.example.messenger.model.user.User;
import com.example.messenger.model.user.UserEntity;
import com.example.messenger.repository.MessageRepository;
import com.example.messenger.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Date;

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
            @RequestBody CreateUser request
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
                savedUserEntity.getAvatarUrl(),
                savedUserEntity.getToken(),
                savedUserEntity.getGoogleId(),
                savedUserEntity.getPassword()
                );

        log.info("user with that email was added to db: "+user.email());
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

    @PostMapping("/addMessage")
    public ResponseEntity<User> addMessage(

    ){
        UserEntity userEntity = userRepository.findById(1L).orElseThrow();

        MessageEntity messageEntity = new MessageEntity( "message1", userEntity);



    }
}
