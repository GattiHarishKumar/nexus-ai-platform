package com.ai.gemini_chat;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ai.gemini_chat.dto.SkillResponse;
import com.ai.gemini_chat.skills.Skill;
import com.ai.gemini_chat.skills.SkillRegistry;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillRegistry skillRegistry;

    public SkillController(SkillRegistry skillRegistry) {
        this.skillRegistry = skillRegistry;
    }

    @GetMapping
    public List<SkillResponse> listSkills() {
        return skillRegistry.getAllSkills().stream()
                .map(this::toResponse)
                .toList();
    }

    private SkillResponse toResponse(Skill skill) {
        return new SkillResponse(
                skill.getId(),
                skill.getName(),
                skill.getDescription(),
                skill.getIcon()
        );
    }
}
