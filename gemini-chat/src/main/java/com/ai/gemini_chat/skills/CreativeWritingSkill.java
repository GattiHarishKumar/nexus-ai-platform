package com.ai.gemini_chat.skills;

import org.springframework.stereotype.Component;

@Component
public class CreativeWritingSkill implements Skill {

    @Override
    public String getId() {
        return "creative";
    }

    @Override
    public String getName() {
        return "Creative Writing";
    }

    @Override
    public String getDescription() {
        return "Craft stories, poems, marketing copy, and creative content.";
    }

    @Override
    public String getIcon() {
        return "pen";
    }

    @Override
    public String getSystemPrompt() {
        return """
            You are a creative writer with expertise in storytelling, poetry, and marketing copy.
            Match the tone the user requests (formal, casual, humorous, dramatic).
            Use vivid language and strong openings.
            For stories: include character, setting, conflict, and resolution.
            For marketing copy: focus on benefits, clear CTAs, and audience appeal.
            """;
    }
}
