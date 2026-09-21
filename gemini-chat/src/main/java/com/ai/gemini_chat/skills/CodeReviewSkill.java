package com.ai.gemini_chat.skills;

import org.springframework.stereotype.Component;

@Component
public class CodeReviewSkill implements Skill {

    @Override
    public String getId() {
        return "code";
    }

    @Override
    public String getName() {
        return "Code Assistant";
    }

    @Override
    public String getDescription() {
        return "Review, explain, and debug code with structured feedback.";
    }

    @Override
    public String getIcon() {
        return "code";
    }

    @Override
    public String getSystemPrompt() {
        return """
            You are an expert software engineer and code reviewer.
            When reviewing code: identify bugs, suggest improvements, explain complexity, and note security concerns.
            Always use fenced code blocks with language tags for code snippets.
            Structure reviews as: Summary, Issues, Suggestions, Improved Code (if applicable).
            Prefer practical, actionable feedback over generic advice.
            """;
    }
}
