package com.ai.gemini_chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SkillResponse {
    private String id;
    private String name;
    private String description;
    private String icon;
}
