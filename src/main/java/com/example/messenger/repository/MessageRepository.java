package com.example.messenger.repository;

import com.example.messenger.model.message.MessageEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<MessageEntity, Long> {
    @Query("select m from MessageEntity m left join fetch m.seenUsers u where m.id = :id")
    Optional< MessageEntity> findWithSeenUsers(@Param("id") long id);

    @Modifying
    @Transactional
    @Query(value = """
    INSERT INTO message_seen_ids (message_id, user_id)
    VALUES (:messageId, :userId)
    ON CONFLICT DO NOTHING
""", nativeQuery = true)
    void markSeen(Long messageId, Long userId);
}
