package com.ai.gemini_chat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ai.gemini_chat.Config.RateLimitService;
import com.ai.gemini_chat.Entity.Conversation;
import com.ai.gemini_chat.Repository.ConversationRepository;
import com.ai.gemini_chat.Services.QnAService;
import com.ai.gemini_chat.dto.ChatRequest;
import com.ai.gemini_chat.dto.MessageResponse;
import com.ai.gemini_chat.dto.SessionResponse;
import com.ai.gemini_chat.rag.RagService;
import com.ai.gemini_chat.skills.Skill;
import com.ai.gemini_chat.skills.SkillRegistry;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/qna")
public class AIController {

    private final QnAService qnAService;
    private final ConversationRepository conversationRepository;
    private final SkillRegistry skillRegistry;
    private final RateLimitService rateLimitService;
    private final RagService ragService;

    public AIController(
            QnAService qnAService,
            ConversationRepository conversationRepository,
            SkillRegistry skillRegistry,
            RateLimitService rateLimitService,
            RagService ragService) {
        this.qnAService = qnAService;
        this.conversationRepository = conversationRepository;
        this.skillRegistry = skillRegistry;
        this.rateLimitService = rateLimitService;
        this.ragService = ragService;
    }

    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(
            Authentication authentication,
            @Valid @RequestBody ChatRequest request) {

        Integer userId = (Integer) authentication.getPrincipal();

        if (!rateLimitService.allowRequest(userId)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Rate limit exceeded. Please wait before sending more messages.");
        }

        String sessionId = request.getSessionId();
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = UUID.randomUUID().toString();
        }

        Skill skill = skillRegistry.getSkill(request.getSkill());
        String enhancedMessage = skill.enhanceUserMessage(request.getMessage().trim());

        List<Conversation> previousConversations =
                conversationRepository.findByUserIdAndSessionIdOrderByCreatedAtAsc(userId, sessionId);

        // RAG: retrieve relevant context + recent turns instead of full history
        String context = ragService.buildContext(
                userId, sessionId, enhancedMessage, previousConversations);

        String fullPrompt = skill.getSystemPrompt();
        if (!context.isBlank()) {
            fullPrompt += "\n\nConversation context:\n" + context;
        }
        fullPrompt += "\nUser: " + enhancedMessage;

        String answer = qnAService.getAnswer(fullPrompt);

        Conversation conversation = new Conversation();
        conversation.setUserId(userId);
        conversation.setSessionId(sessionId);
        conversation.setUserMessage(request.getMessage().trim());
        conversation.setAiResponse(answer);
        conversation.setCreatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Index this turn for future RAG retrieval
        ragService.indexTurn(conversation);

        return ResponseEntity.ok(new AskResponse(answer, sessionId));
    }

    @PostMapping("/session")
    public ResponseEntity<SessionResponse> createSession() {
        String sessionId = UUID.randomUUID().toString();
        return ResponseEntity.ok(new SessionResponse(sessionId, "New Chat", LocalDateTime.now()));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> listSessions(Authentication authentication) {
        Integer userId = (Integer) authentication.getPrincipal();
        List<Conversation> latest = conversationRepository.findLatestPerSession(userId);

        List<SessionResponse> sessions = new ArrayList<>();
        for (Conversation conv : latest) {
            String title = conv.getUserMessage();
            if (title.length() > 50) {
                title = title.substring(0, 47) + "...";
            }
            sessions.add(new SessionResponse(conv.getSessionId(), title, conv.getCreatedAt()));
        }
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<MessageResponse>> getHistory(
            Authentication authentication,
            @PathVariable String sessionId) {

        Integer userId = (Integer) authentication.getPrincipal();
        List<Conversation> conversations =
                conversationRepository.findByUserIdAndSessionIdOrderByCreatedAtAsc(userId, sessionId);

        List<MessageResponse> messages = new ArrayList<>();
        for (Conversation conv : conversations) {
            messages.add(new MessageResponse("user", conv.getUserMessage(), conv.getCreatedAt()));
            messages.add(new MessageResponse("assistant", conv.getAiResponse(), conv.getCreatedAt()));
        }
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Void> deleteSession(
            Authentication authentication,
            @PathVariable String sessionId) {

        Integer userId = (Integer) authentication.getPrincipal();
        conversationRepository.deleteByUserIdAndSessionId(userId, sessionId);
        ragService.deleteSessionVectors(userId, sessionId);
        return ResponseEntity.noContent().build();
    }

    public record AskResponse(String answer, String sessionId) {}
}
