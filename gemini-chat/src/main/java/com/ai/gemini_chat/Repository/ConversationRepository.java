package com.ai.gemini_chat.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.ai.gemini_chat.Entity.Conversation;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findByUserIdAndSessionIdOrderByCreatedAtAsc(Integer userId, String sessionId);

    List<Conversation> findByUserIdOrderByCreatedAtDesc(Integer userId);

    void deleteByUserIdAndSessionId(Integer userId, String sessionId);

    @Query("""
        SELECT c FROM Conversation c
        WHERE c.userId = :userId
        AND c.id IN (
            SELECT MAX(c2.id) FROM Conversation c2
            WHERE c2.userId = :userId
            GROUP BY c2.sessionId
        )
        ORDER BY c.createdAt DESC
        """)
    List<Conversation> findLatestPerSession(@Param("userId") Integer userId);
}
