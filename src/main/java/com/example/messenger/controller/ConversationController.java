package com.example.messenger.controller;

import com.example.messenger.model.ContactPreviewDto;
import com.example.messenger.model.conversation.ConversationEntity;
import com.example.messenger.model.conversation.ConversationWithMessages;
import com.example.messenger.model.conversation.CreateGroupRequest;
import com.example.messenger.model.user.AuthResponse;
import com.example.messenger.model.user.JwtUserSubject;
import com.example.messenger.model.user.request.SignUpRequest;
import com.example.messenger.service.ConversationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/conversation")
public class ConversationController {
    private static final Logger log = LoggerFactory.getLogger(ConversationController.class);
    private  final ConversationService conversationService;

    ConversationController(ConversationService conversationService){
        this.conversationService=conversationService;
    }
    @GetMapping("/getContacts")
    public ResponseEntity<List<ContactPreviewDto>> getConversations(@AuthenticationPrincipal JwtUserSubject currentUser){
        log.info("Get conversations for user with id: '"+currentUser.id());

        return ResponseEntity.status(200).body(conversationService.getContacts(currentUser.id())) ;
    }
    @GetMapping("/direct/{userId}")
    public ResponseEntity<ConversationWithMessages> getDirectConversation(
            @PathVariable Long userId,
            @AuthenticationPrincipal JwtUserSubject currentUser
    ){
        return ResponseEntity.status(200).body(conversationService.getDirectConversation(currentUser.id(), userId)) ;
    }
    @PostMapping("/createGroup")
    public ResponseEntity<ConversationWithMessages> createGroup(
            @RequestBody @Valid CreateGroupRequest createGroupRequest,
            @AuthenticationPrincipal JwtUserSubject currentUser
    ){
        return ResponseEntity.status(200).body(conversationService.createGroup(createGroupRequest, currentUser.id())) ;
    }
    @GetMapping("/group/{conversationId}")
    public ResponseEntity<ConversationWithMessages> getGroupConversation(@PathVariable Long conversationId, @AuthenticationPrincipal JwtUserSubject currentUser
    ){
        return ResponseEntity.status(200).body(conversationService.getGroup(conversationId)) ;
    }
    @DeleteMapping("/group/{conversationId}/members/{memberId}")
    public ResponseEntity<Void> kickFromConversation(
            @PathVariable Long conversationId,
            @PathVariable Long memberId,
            @AuthenticationPrincipal JwtUserSubject currentUser
    ){
        conversationService.kickUser(conversationId,memberId, currentUser.id());
        return ResponseEntity.status(200).build();
    }

}
