package com.example.messenger.controller;

import com.example.messenger.model.user.*;
import com.example.messenger.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
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
    @PostMapping("/googleAuth")
    public ResponseEntity<AuthResponse> googleAuth(@RequestBody GoogleAuthRequest googleAuthRequest)  {
        log.info("Google auth with '"+googleAuthRequest.googleToken()+"' token");
        return ResponseEntity.status(201).body(authService.googleAuth(googleAuthRequest)) ;
    }
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshAuthRequest refreshAuthRequest)  {
        log.info("Refresh of user by"+refreshAuthRequest.jwt()+"' jwt");
        return ResponseEntity.status(201).body(authService.refresh(refreshAuthRequest)) ;
    }
}
