package com.ai.gemini_chat.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SessionResponse {
    private String sessionId;
    private String title;
    private LocalDateTime lastMessageAt;
}
