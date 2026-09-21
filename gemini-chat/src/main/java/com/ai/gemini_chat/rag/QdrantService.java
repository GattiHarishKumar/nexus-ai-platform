package com.ai.gemini_chat.rag;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Stores and searches vectors in Qdrant (open-source vector DB).
 */
@Service
public class QdrantService {

    private static final Logger log = LoggerFactory.getLogger(QdrantService.class);

    @Value("${qdrant.url}")
    private String qdrantUrl;

    @Value("${qdrant.collection}")
    private String collection;

    private final WebClient webClient;
    private final EmbeddingService embeddingService;
    private volatile boolean available = false;

    public QdrantService(WebClient.Builder webClientBuilder, EmbeddingService embeddingService) {
        this.webClient = webClientBuilder.build();
        this.embeddingService = embeddingService;
    }

    private WebClient client() {
        return webClient.mutate().baseUrl(qdrantUrl).build();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initCollection() {
        try {
            client().get()
                    .uri("/collections/{name}", collection)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            available = true;
            log.info("Qdrant collection '{}' already exists at {}", collection, qdrantUrl);
        } catch (Exception e) {
            try {
                client().put()
                        .uri("/collections/{name}", collection)
                        .bodyValue(Map.of(
                                "vectors", Map.of(
                                        "size", embeddingService.getVectorSize(),
                                        "distance", "Cosine"
                                )
                        ))
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();
                available = true;
                log.info("Qdrant collection '{}' created at {}", collection, qdrantUrl);
            } catch (Exception ex) {
                available = false;
                log.warn("Qdrant unavailable at {} — RAG disabled. {}", qdrantUrl, ex.getMessage());
            }
        }
    }

    public boolean isAvailable() {
        return available;
    }

    public void upsert(long pointId, float[] vector, Map<String, Object> payload) {
        if (!available || vector == null) {
            return;
        }

        Map<String, Object> point = Map.of(
                "id", pointId,
                "vector", vector,
                "payload", payload
        );

        try {
            client().put()
                    .uri("/collections/{name}/points", collection)
                    .bodyValue(Map.of("points", List.of(point)))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.warn("Failed to upsert vector: {}", e.getMessage());
        }
    }

    public List<String> search(float[] vector, int userId, String sessionId, int limit) {
        if (!available || vector == null) {
            return List.of();
        }

        Map<String, Object> filter = Map.of(
                "must", List.of(
                        Map.of("key", "userId", "match", Map.of("value", userId)),
                        Map.of("key", "sessionId", "match", Map.of("value", sessionId))
                )
        );

        Map<String, Object> body = Map.of(
                "vector", vector,
                "limit", limit,
                "with_payload", true,
                "filter", filter
        );

        try {
            String response = client().post()
                    .uri("/collections/{name}/points/search", collection)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return extractTexts(response);
        } catch (Exception e) {
            log.warn("Qdrant search failed: {}", e.getMessage());
            return List.of();
        }
    }

    public void deleteBySession(int userId, String sessionId) {
        if (!available) {
            return;
        }

        Map<String, Object> filter = Map.of(
                "must", List.of(
                        Map.of("key", "userId", "match", Map.of("value", userId)),
                        Map.of("key", "sessionId", "match", Map.of("value", sessionId))
                )
        );

        try {
            client().post()
                    .uri("/collections/{name}/points/delete", collection)
                    .bodyValue(Map.of("filter", filter))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.warn("Failed to delete session vectors: {}", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> extractTexts(String json) {
        List<String> results = new ArrayList<>();
        try {
            var mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            var root = mapper.readTree(json);
            for (var hit : root.path("result")) {
                var text = hit.path("payload").path("text").asText(null);
                if (text != null && !text.isBlank()) {
                    results.add(text);
                }
            }
        } catch (Exception ignored) {
        }
        return results;
    }
}
