package com.example.messenger.service;

import com.example.messenger.exception.userExceptions.InvalidCredentialsException;
import com.example.messenger.mapper.UserMapper;
import com.example.messenger.model.user.*;
import com.example.messenger.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    public AuthService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse signUp(SignUpRequest signUpRequest){
        if(userRepository.findByEmail(signUpRequest.email()).isPresent()){
            throw new InvalidCredentialsException();
        }
        String hashedPassword =  passwordEncoder.encode(signUpRequest.password());

        UserEntity userEntity = new UserEntity(signUpRequest.email(), signUpRequest.name(),hashedPassword);
        UserEntity savedUserEntity =  userRepository.save(userEntity);

        String token = jwtService.buildToken(savedUserEntity.getId());


        return new AuthResponse(userMapper.convertToDomain(savedUserEntity), token);
    }
    public AuthResponse signIn(SignInRequest signInRequest){
        UserEntity userEntity = userRepository.findByEmail(signInRequest.email()).orElseThrow(InvalidCredentialsException::new);



        if(!passwordEncoder.matches(signInRequest.password(),userEntity.getPassword())){
            throw new InvalidCredentialsException();

        }

        String token = jwtService.buildToken(userEntity.getId());


        return new AuthResponse(userMapper.convertToDomain(userEntity), token);
    }
}
