package com.example.messenger.repository;

import com.example.messenger.model.conversation.ConversationEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationRepository extends JpaRepository<ConversationEntity, Long> {
    @Query("""
    SELECT DISTINCT c FROM ConversationEntity c
    LEFT JOIN FETCH c.lastMessage
    LEFT JOIN c.members m
    WHERE EXISTS (
        SELECT 1 FROM c.members m WHERE m.id = :id
    )
    ORDER BY c.lastMessage.sentAt DESC
    """)
    List<ConversationEntity> findAllByUserId(Long id);

    @Query("""
        SELECT c FROM ConversationEntity c
        LEFT JOIN FETCH c.lastMessage
        WHERE c.conversationKey = :key
    """)
    Optional<ConversationEntity> findByKey(String key);
//    @Modifying
//    @Transactional
//    @Query("delete from ConversationEntity c where c.id=:id")
//    void deleteById(@Param("id") Long id);
}
