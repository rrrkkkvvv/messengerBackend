package com.example.messenger.service;

import com.example.messenger.exception.userExceptions.InvalidCredentialsException;
import com.example.messenger.mapper.UserMapper;
import com.example.messenger.model.user.AvatarAction;
import com.example.messenger.model.user.User;
import com.example.messenger.model.user.UserEntity;
import com.example.messenger.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final CloudinaryService cloudinaryService;

    UserService(UserRepository userRepository, UserMapper userMapper,CloudinaryService cloudinaryService){
        this.userRepository = userRepository;
        this.userMapper=userMapper;
        this.cloudinaryService = cloudinaryService;

    }
    public UserEntity getById(Long id) {
        return userRepository.findById(id).orElseThrow(InvalidCredentialsException::new);
    }
    public void deleteById(Long id){
        userRepository.deleteById(id);
    }
    public User updateById(Long id, String name, AvatarAction avatarAction, MultipartFile avatar){
        UserEntity userEntity = userRepository.findById(id).orElseThrow(InvalidCredentialsException::new);
        if (name != null && !name.isBlank()) {
            userEntity.setName(name);
        }

        if (avatar != null && !avatar.isEmpty() && avatarAction.equals(AvatarAction.SET)) {
            String avatarUrl = cloudinaryService.uploadFile(avatar, "folder_1");
            userEntity.setAvatarUrl(avatarUrl);
        }else if(avatarAction.equals(AvatarAction.REMOVE)){
            userEntity.setAvatarUrl(null);
        }

        userRepository.save(userEntity);

        return userMapper.convertToDomain(userEntity);
    }
}
