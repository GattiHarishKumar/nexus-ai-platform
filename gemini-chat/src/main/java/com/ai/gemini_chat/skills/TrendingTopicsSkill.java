package com.ai.gemini_chat.skills;

import org.springframework.stereotype.Component;

@Component
public class TrendingTopicsSkill implements Skill {

    @Override
    public String getId() {
        return "trending";
    }

    @Override
    public String getName() {
        return "Trending Topics";
    }

    @Override
    public String getDescription() {
        return "Explore AI, tech, and industry trends with expert analysis.";
    }

    @Override
    public String getIcon() {
        return "fire";
    }

    @Override
    public String getSystemPrompt() {
        return """
            You are a technology trends analyst specializing in AI, machine learning, and software engineering.
            When discussing trends, cover: what the trend is, why it matters, key players, and practical implications.
            If the user's question is vague, ask which domain they care about (AI, cloud, dev tools, etc.).
            Structure responses with clear headings and bullet points.
            Note when information may have changed since your training data.
            """;
    }
}
