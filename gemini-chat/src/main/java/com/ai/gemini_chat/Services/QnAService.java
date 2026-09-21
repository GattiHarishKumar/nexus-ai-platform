package com.ai.gemini_chat.Services;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class QnAService {

    private static final Logger log = LoggerFactory.getLogger(QnAService.class);

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.fallback.url}")
    private String geminiFallbackUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    public QnAService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    public String getAnswer(String question) {
        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            return "Gemini API key is not configured. Set GEMINI_API_KEY environment variable.";
        }

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] {
                                Map.of("text", question)
                        })
                }
        );

        String[] endpoints = new String[] {
                geminiApiUrl,
                geminiFallbackUrl,
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key="
        };

        for (String endpoint : endpoints) {
            for (int attempt = 1; attempt <= 2; attempt++) {
                try {
                    return callModel(endpoint, requestBody);
                } catch (WebClientResponseException e) {
                    if (e.getStatusCode().value() == 503 || e.getStatusCode().value() == 429) {
                        log.warn("AI endpoint {} returned {}, attempt {}. Retrying in 1200ms...", endpoint, e.getStatusCode(), attempt);
                        try {
                            Thread.sleep(1200);
                        } catch (InterruptedException ignored) {}
                    } else {
                        log.error("AI service error on {}: {}", endpoint, e.getMessage());
                        break;
                    }
                } catch (Exception e) {
                    log.warn("Failed calling {} (attempt {}): {}", endpoint, attempt, e.getMessage());
                    break;
                }
            }
        }

        return "AI service is currently busy. Please try again in a few moments.";
    }

    private String callModel(String endpointUrl, Map<String, Object> requestBody) {
        String response = webClient.post()
                .uri(endpointUrl + geminiApiKey)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .block();

        return extractModelResponse(response);
    }

    private String extractModelResponse(String jsonResponse) {
        try {
            JsonNode rootNode = objectMapper.readTree(jsonResponse);
            JsonNode candidates = rootNode.path("candidates");
            if (candidates.isEmpty()) {
                JsonNode error = rootNode.path("error").path("message");
                return error.isMissingNode() ? "No response from AI." : error.asText();
            }
            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (parts.isArray()) {
                StringBuilder sb = new StringBuilder();
                for (JsonNode part : parts) {
                    JsonNode textNode = part.path("text");
                    if (!textNode.isMissingNode()) {
                        sb.append(textNode.asText());
                    }
                }
                String result = sb.toString().trim();
                if (!result.isEmpty()) {
                    return result;
                }
            }
            return "No response text found from AI.";
        } catch (Exception e) {
            return "Error parsing AI response. Please try again.";
        }
    }
}
