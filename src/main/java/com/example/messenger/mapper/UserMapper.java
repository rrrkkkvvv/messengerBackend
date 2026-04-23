package com.example.messenger.mapper;

import com.example.messenger.model.user.User;
import com.example.messenger.model.user.UserEntity;
import org.springframework.stereotype.Component;
@Component
public  class UserMapper {
    public User convertToDomain(UserEntity userEntity){
        return new User(
                userEntity.getId(),
                userEntity.getEmail(),
                userEntity.getName(),
                userEntity.getAvatarUrl()
        );
    }
}
