package com.ai.gemini_chat.rag;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Converts text to vectors using Google's Gemini embedding model.
 */
@Service
public class EmbeddingService {

    private static final int VECTOR_SIZE = 768;

    @Value("${gemini.embedding.url}")
    private String embeddingUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public EmbeddingService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public int getVectorSize() {
        return VECTOR_SIZE;
    }

    public float[] embed(String text) {
        if (apiKey == null || apiKey.isBlank()) {
            return null;
        }

        Map<String, Object> body = Map.of(
                "content", Map.of("parts", List.of(Map.of("text", text))),
                "outputDimensionality", VECTOR_SIZE
        );

        try {
            String response = webClient.post()
                    .uri(embeddingUrl + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode values = objectMapper.readTree(response)
                    .path("embedding")
                    .path("values");

            if (values.isMissingNode() || !values.isArray()) {
                return null;
            }

            float[] vector = new float[values.size()];
            for (int i = 0; i < values.size(); i++) {
                vector[i] = (float) values.get(i).asDouble();
            }
            return vector;
        } catch (Exception e) {
            return null;
        }
    }
}
