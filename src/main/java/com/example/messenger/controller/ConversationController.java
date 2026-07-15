package com.example.messenger.controller;

import com.example.messenger.model.GetContactsResponse;
import com.example.messenger.model.conversation.*;
import com.example.messenger.model.AvatarAction;
import com.example.messenger.model.user.JwtUserSubject;
import com.example.messenger.service.ConversationService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/conversation")
public class ConversationController {
    private static final Logger log = LoggerFactory.getLogger(ConversationController.class);
    private  final ConversationService conversationService;

    ConversationController(ConversationService conversationService){
        this.conversationService=conversationService;
    }
    @GetMapping("/getContacts")
    public ResponseEntity<GetContactsResponse> getConversations(@AuthenticationPrincipal JwtUserSubject currentUser){
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
        return ResponseEntity.status(200).body(conversationService.getGroup(conversationId, currentUser.id())) ;
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
    @PostMapping("/group/{conversationId}/members")
    public ResponseEntity<Void> addMembersToConversation(
            @PathVariable Long conversationId,
            @RequestBody @Valid AddToGroupRequest addToGroupRequest,
            @AuthenticationPrincipal JwtUserSubject currentUser
    ){
        conversationService.addUsers(conversationId, addToGroupRequest.memberIds(), currentUser.id());
        return ResponseEntity.status(200).build();
    }
    @DeleteMapping("/group/{conversationId}/leave")
    public ResponseEntity<Void> leaveConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal JwtUserSubject currentUser
    ){
        conversationService.leaveConversation(conversationId, currentUser.id());
        return ResponseEntity.status(200).build();
    }
    @PatchMapping("/group/{conversationId}")
    public ResponseEntity<GroupContactPreviewDto> updateConversation(
            @PathVariable Long conversationId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false)  String avatarAction,
            @RequestPart(required = false) MultipartFile avatar,
            @AuthenticationPrincipal JwtUserSubject currentUser
            ){


        AvatarAction action = avatarAction != null
                ? AvatarAction.valueOf(avatarAction)
                : AvatarAction.NONE;

        return ResponseEntity.status(200).body(
                conversationService.updateById(
                        conversationId,
                        currentUser.id(),
                        name,
                        action,
                        avatar
                )
        ) ;

    }
    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal JwtUserSubject currentUser
    ){
        conversationService.deleteById(conversationId, currentUser.id());
        return ResponseEntity.status(200).build();
    }
}
