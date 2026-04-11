package com.example.messenger.service;

import com.example.messenger.mapper.UserMapper;
import com.example.messenger.model.user.SignUpRequest;
import com.example.messenger.model.user.User;
import com.example.messenger.model.user.UserEntity;
import com.example.messenger.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;

public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtSe
    public AuthService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;

    }

    public User signUp(SignUpRequest signUpRequest){
        if(userRepository.findByEmail().isPresent()){
            throw new RuntimeException("User exists");
        }
        String hashedPassword =  passwordEncoder.encode(signUpRequest.password());
        UserEntity userEntity = new UserEntity(signUpRequest.email(), signUpRequest.name(),hashedPassword);
        UserEntity savedUserEntity =  userRepository.save(userEntity);

    }
}
