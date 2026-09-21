package com.ai.gemini_chat.rag;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.ai.gemini_chat.Entity.Conversation;

/**
 * Builds optimized prompts using RAG instead of sending the full chat history.
 *
 * Strategy:
 * 1. Always include the last N turns verbatim (recent context).
 * 2. For older messages, retrieve only the top-K most relevant chunks via vector search.
 * 3. This keeps token usage low even in long conversations.
 */
@Service
public class RagService {

    @Value("${rag.recent-turns:2}")
    private int recentTurns;

    @Value("${rag.top-k:3}")
    private int topK;

    private final EmbeddingService embeddingService;
    private final QdrantService qdrantService;

    public RagService(EmbeddingService embeddingService, QdrantService qdrantService) {
        this.embeddingService = embeddingService;
        this.qdrantService = qdrantService;
    }

    /**
     * Build a compact context string for the LLM prompt.
     */
    public String buildContext(int userId, String sessionId, String currentMessage,
                               List<Conversation> allTurns) {

        if (allTurns.isEmpty()) {
            return "";
        }

        // Short conversations: send everything (no RAG overhead needed)
        if (allTurns.size() <= recentTurns) {
            return formatTurns(allTurns);
        }

        // Qdrant down: still limit to recent turns to save tokens
        if (!qdrantService.isAvailable()) {
            int splitIndex = Math.max(0, allTurns.size() - recentTurns);
            return formatTurns(allTurns.subList(splitIndex, allTurns.size()));
        }

        int splitIndex = Math.max(0, allTurns.size() - recentTurns);
        List<Conversation> recent = allTurns.subList(splitIndex, allTurns.size());

        StringBuilder context = new StringBuilder();

        // Retrieve relevant older chunks via vector search
        float[] queryVector = embeddingService.embed(currentMessage);
        List<String> relevantChunks = qdrantService.search(queryVector, userId, sessionId, topK);

        if (!relevantChunks.isEmpty()) {
            context.append("Relevant context from earlier in this conversation:\n");
            for (String chunk : relevantChunks) {
                context.append("- ").append(chunk).append("\n");
            }
            context.append("\n");
        }

        context.append("Recent messages:\n");
        context.append(formatTurns(recent));

        return context.toString();
    }

    /**
     * Index a completed conversation turn into the vector store.
     */
    public void indexTurn(Conversation turn) {
        String text = "User: " + turn.getUserMessage() + "\nAI: " + turn.getAiResponse();
        float[] vector = embeddingService.embed(text);
        if (vector == null) {
            return;
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", turn.getUserId());
        payload.put("sessionId", turn.getSessionId());
        payload.put("text", text);

        qdrantService.upsert(turn.getId(), vector, payload);
    }

    public void deleteSessionVectors(int userId, String sessionId) {
        qdrantService.deleteBySession(userId, sessionId);
    }

    private String formatTurns(List<Conversation> turns) {
        StringBuilder sb = new StringBuilder();
        for (Conversation turn : turns) {
            sb.append("User: ").append(turn.getUserMessage()).append("\n");
            sb.append("AI: ").append(turn.getAiResponse()).append("\n");
        }
        return sb.toString();
    }
}
