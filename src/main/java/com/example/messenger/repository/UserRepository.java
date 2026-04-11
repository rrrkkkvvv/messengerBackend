package com.example.messenger.repository;

import com.example.messenger.model.user.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    @Query
    Optional< UserEntity >findByEmail();
}
