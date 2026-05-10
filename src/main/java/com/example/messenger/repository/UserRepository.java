package com.example.messenger.repository;

import com.example.messenger.model.user.UserEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, Long> {
    @Query
    Optional< UserEntity >findByEmail(String email);

    @Query("select u from UserEntity u where u.id != :id")
    List<UserEntity> findAllExceptId(@Param("id") Long id);


}
