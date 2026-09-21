package com.ai.gemini_chat.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MessageResponse {
    private String role;
    private String content;
    private LocalDateTime createdAt;
}
