package com.example.messenger.controller;

import com.cloudinary.Cloudinary;
import com.example.messenger.model.user.AvatarAction;
import com.example.messenger.model.user.User;
import com.example.messenger.model.user.request.DeleteAccountRequest;
import com.example.messenger.service.CloudinaryService;
import com.example.messenger.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/user")
public class UserController {
    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;

    UserController(UserService userService){
        this.userService=userService;
    }

    @DeleteMapping("/deleteAccount")
    public ResponseEntity<Void> deleteAccount(@RequestBody @Valid DeleteAccountRequest deleteAccountRequest){
        userService.deleteById(deleteAccountRequest.id());
        return ResponseEntity.ok().build();
    }
    @PatchMapping("/updateProfile")
    public ResponseEntity<User> updateProfile(
            @RequestParam Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false)  String avatarAction,
            @RequestPart(required = false) MultipartFile avatar
    ){
        AvatarAction action = avatarAction != null
                ? AvatarAction.valueOf(avatarAction)
                : null;

         return ResponseEntity.status(200).body(userService.updateById(id, name, action, avatar)) ;
    }

}
