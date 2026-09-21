import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTerminal,
    faFire,
    faCode,
    faList,
    faPen,
} from "@fortawesome/free-solid-svg-icons";

const ICON_MAP = {
    robot: faTerminal,
    general: faTerminal,
    fire: faFire,
    trending: faFire,
    code: faCode,
    list: faList,
    summarize: faList,
    pen: faPen,
    creative: faPen,
};

const SkillPicker = ({ skills, activeSkill, onSelect, disabled }) => {
    return (
        <div className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/60 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider hidden sm:inline mr-1">
                Capability:
            </span>
            {skills.map((skill) => {
                const isActive = activeSkill === skill.id;
                const icon = ICON_MAP[skill.icon] || ICON_MAP[skill.id] || faTerminal;

                return (
                    <button
                        key={skill.id}
                        onClick={() => onSelect(skill.id)}
                        disabled={disabled}
                        title={skill.description}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                            isActive
                                ? "bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-border)] shadow-xs"
                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        <FontAwesomeIcon
                            icon={icon}
                            className={`text-[10px] transition-colors ${
                                isActive ? "text-[var(--accent-primary)]" : "opacity-60"
                            }`}
                        />
                        <span>{skill.name}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default SkillPicker;
