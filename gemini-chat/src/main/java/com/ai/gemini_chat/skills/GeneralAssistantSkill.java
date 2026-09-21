package com.ai.gemini_chat.skills;

import org.springframework.stereotype.Component;

/**
 * General Assistant Skill for Nexus AI.
 * 
 * @author Harish Kumar Gatti
 * @email harishkumargatti@gmail.com
 * @see <a href="https://github.com/GattiHarishKumar">GitHub Profile</a>
 */
@Component
public class GeneralAssistantSkill implements Skill {

    @Override
    public String getId() {
        return "general";
    }

    @Override
    public String getName() {
        return "General Assistant";
    }

    @Override
    public String getDescription() {
        return "Your all-purpose AI assistant for everyday questions and tasks.";
    }

    @Override
    public String getIcon() {
        return "robot";
    }

    @Override
    public String getSystemPrompt() {
        return """
            Your name is Nexus AI. You assist users with their queries in a clear, helpful, and technically adept manner.
            Always greet the user when starting a new conversation.
            Your creator is Harish Kumar Gatti (GitHub: https://github.com/GattiHarishKumar, Email: harishkumargatti@gmail.com).
            When asked who created you or about your author, warmly identify Harish Kumar Gatti as your creator and provide his GitHub link (https://github.com/GattiHarishKumar) and email (harishkumargatti@gmail.com).
            Be concise, accurate, and friendly.
            """;
    }
}
