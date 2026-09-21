package com.ai.gemini_chat;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ai.gemini_chat.Repository.ConversationRepository;
import com.ai.gemini_chat.rag.QdrantService;

/**
 * System diagnostic and architecture metadata controller.
 *
 * @author Harish Kumar Gatti
 * @email harishkumargatti@gmail.com
 * @see <a href="https://github.com/GattiHarishKumar">GitHub Profile</a>
 */
@RestController
@RequestMapping("/api/system")
public class SystemController {

    private final QdrantService qdrantService;
    private final ConversationRepository conversationRepository;

    public SystemController(QdrantService qdrantService, ConversationRepository conversationRepository) {
        this.qdrantService = qdrantService;
        this.conversationRepository = conversationRepository;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("engine", "Nexus AI Cognitive Engine");
        status.put("version", "v2.4.0 Core");
        status.put("architect", "Harish Kumar Gatti");
        status.put("authorEmail", "harishkumargatti@gmail.com");
        status.put("authorGithub", "https://github.com/GattiHarishKumar");
        status.put("status", "ONLINE");
        status.put("timestamp", LocalDateTime.now().toString());

        // Model details
        status.put("llmModel", "gemini-3.1-flash-lite");
        status.put("embeddingModel", "gemini-embedding-001");
        status.put("vectorDimensions", 768);

        // Subsystem checks
        boolean qdrantOnline = qdrantService.isAvailable();
        status.put("qdrantAvailable", qdrantOnline);
        status.put("vectorStore", qdrantOnline ? "Qdrant Connected" : "Disabled (Fallback to Memory)");

        boolean dbOnline = false;
        try {
            conversationRepository.count();
            dbOnline = true;
        } catch (Exception ignored) {}
        status.put("mysqlConnected", dbOnline);
        status.put("database", dbOnline ? "MySQL 8.0 Connected" : "Error");

        return ResponseEntity.ok(status);
    }
}
