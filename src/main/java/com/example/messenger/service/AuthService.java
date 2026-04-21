package com.example.messenger.service;

import com.example.messenger.exception.userExceptions.InvalidCredentialsException;
import com.example.messenger.mapper.UserMapper;
import com.example.messenger.model.user.*;
import com.example.messenger.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.auth.oauth2.GoogleCredentials;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.util.Collections;
import java.util.Optional;

@Service
public class AuthService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final String googleClientId;


    public AuthService(
            UserRepository userRepository,
           UserMapper userMapper,
           PasswordEncoder passwordEncoder,
           JwtService jwtService,
           @Value("${google.client-id}") String googleClientId
    ) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.googleClientId = googleClientId;

    }

    public AuthResponse signUp(SignUpRequest signUpRequest){
        if(userRepository.findByEmail(signUpRequest.email()).isPresent()){
            throw new InvalidCredentialsException();
        }
        String hashedPassword =  passwordEncoder.encode(signUpRequest.password());

        UserEntity userEntity = new UserEntity(signUpRequest.email(), signUpRequest.name(),hashedPassword);
        UserEntity savedUserEntity =  userRepository.save(userEntity);

        String token = jwtService.buildToken(new JwtUserSubject(savedUserEntity.getId(), savedUserEntity.getEmail()) );


        return new AuthResponse(userMapper.convertToDomain(savedUserEntity), token);
    }
    public AuthResponse signIn(SignInRequest signInRequest){
        UserEntity userEntity = userRepository.findByEmail(signInRequest.email()).orElseThrow(InvalidCredentialsException::new);



        if(!passwordEncoder.matches(signInRequest.password(),userEntity.getPassword()) || userEntity.getGoogleId()!=null){
            throw new InvalidCredentialsException();

        }

        String token = jwtService.buildToken(new JwtUserSubject(userEntity.getId(), userEntity.getEmail()) );


        return new AuthResponse(userMapper.convertToDomain(userEntity), token);
    }
    public AuthResponse googleAuth(GoogleAuthRequest googleAuthRequest)  {


            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            try {
                GoogleIdToken idToken = verifier.verify(googleAuthRequest.googleToken());


            if (idToken == null) {
                throw new InvalidCredentialsException();
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String googleId = payload.getSubject();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");


            Optional<UserEntity> userEntity = userRepository.findByEmail(email);
            if(userEntity.isPresent()){
                String token = jwtService.buildToken(new JwtUserSubject(userEntity.get().getId(), userEntity.get().getEmail()) );
                return new AuthResponse(userMapper.convertToDomain(userEntity.get()), token);
            }else{
                UserEntity  newUserEntity = new UserEntity(email, name, picture, googleId);
                UserEntity savedUserEntity = userRepository.save(newUserEntity);
                String token = jwtService.buildToken(new JwtUserSubject(savedUserEntity.getId(), savedUserEntity.getEmail()) );
                return new AuthResponse(userMapper.convertToDomain(savedUserEntity), token);
            }

            }catch (Exception e){
                throw new InvalidCredentialsException();
            }


    }
    public AuthResponse refresh(RefreshAuthRequest refreshAuthRequest)  {

        JwtUserSubject userData = jwtService.extractUserData(refreshAuthRequest.jwt());

        UserEntity userEntity = userRepository.findById(userData.id()).orElseThrow(InvalidCredentialsException::new);
        System.out.println(userEntity.getId());
        String token = jwtService.buildToken(new JwtUserSubject(userEntity.getId(), userEntity.getEmail()) );

        return new AuthResponse(userMapper.convertToDomain(userEntity), token);


    }
}
