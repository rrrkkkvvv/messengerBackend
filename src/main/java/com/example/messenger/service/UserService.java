package com.example.messenger.service;

import com.example.messenger.exception.userExceptions.InvalidCredentialsException;
import com.example.messenger.model.user.UserEntity;
import com.example.messenger.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;

    UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }
    public UserEntity getById(Long id) {
        return userRepository.findById(id).orElseThrow(InvalidCredentialsException::new);
    }
}
