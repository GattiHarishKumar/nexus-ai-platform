package com.ai.gemini_chat.skills;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class SkillRegistry {

    private final Map<String, Skill> skills = new LinkedHashMap<>();

    public SkillRegistry(List<Skill> skillList) {
        for (Skill skill : skillList) {
            skills.put(skill.getId(), skill);
        }
    }

    public Skill getSkill(String id) {
        if (id == null || id.isBlank()) {
            return skills.get("general");
        }
        return skills.getOrDefault(id, skills.get("general"));
    }

    public Collection<Skill> getAllSkills() {
        return skills.values();
    }
}
