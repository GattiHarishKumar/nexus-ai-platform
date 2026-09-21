package com.ai.gemini_chat.skills;

public interface Skill {
    String getId();
    String getName();
    String getDescription();
    String getIcon();
    String getSystemPrompt();
    default String enhanceUserMessage(String message) {
        return message;
    }
}
