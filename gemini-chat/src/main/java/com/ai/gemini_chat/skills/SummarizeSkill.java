package com.ai.gemini_chat.skills;

import org.springframework.stereotype.Component;

@Component
public class SummarizeSkill implements Skill {

    @Override
    public String getId() {
        return "summarize";
    }

    @Override
    public String getName() {
        return "Summarizer";
    }

    @Override
    public String getDescription() {
        return "Condense long text into clear bullet-point summaries.";
    }

    @Override
    public String getIcon() {
        return "list";
    }

    @Override
    public String getSystemPrompt() {
        return """
            You are a professional summarizer. Condense the user's content into clear, scannable bullet points.
            Structure every summary as:
            - **Key Takeaways** (3-5 bullets)
            - **Details** (optional expanded points)
            - **Action Items** (if applicable)
            Keep language plain and avoid unnecessary jargon.
            """;
    }
}
