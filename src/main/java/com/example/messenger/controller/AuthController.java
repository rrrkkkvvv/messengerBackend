package com.example.messenger.controller;

import com.example.messenger.model.user.AuthResponse;
import com.example.messenger.model.user.SignInRequest;
import com.example.messenger.model.user.SignUpRequest;
import com.example.messenger.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(TestController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    @PostMapping("/signUp")
    public ResponseEntity<AuthResponse> signUp(@RequestBody @Valid SignUpRequest signUpRequest){
        log.info("User with email: '"+signUpRequest.name()+"' was signed up");
        return ResponseEntity.status(201).body(authService.signUp(signUpRequest)) ;
    }
    @PostMapping("/signIn")
    public ResponseEntity<AuthResponse> signIn(@RequestBody @Valid SignInRequest signInRequest){
        log.info("Sign in by: '"+signInRequest.email());
        return ResponseEntity.status(201).body(authService.signIn(signInRequest)) ;
    }
    //    TODO:GOOGLE AUTH WITH OAuth2Client
}
