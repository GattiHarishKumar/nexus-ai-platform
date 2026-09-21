import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMicrochip,
    faCode,
    faDatabase,
    faShieldHalved,
    faFileCode,
    faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import MessageBubble from "./MessageBubble";

const SUGGESTIONS = [
    {
        icon: faCode,
        title: "System Architecture",
        desc: "Compare microservices vs modular monolith tradeoffs",
        prompt: "Compare microservices vs modular monolith tradeoffs for high-traffic platforms.",
    },
    {
        icon: faDatabase,
        title: "Database Optimization",
        desc: "Indexing strategies for MySQL under heavy load",
        prompt: "Give me the top indexing and caching strategies for MySQL handling millions of rows.",
    },
    {
        icon: faShieldHalved,
        title: "API Security Audit",
        desc: "Essential security checklist for JWT and CORS",
        prompt: "What is the security checklist for hardening Spring Boot REST APIs with JWT and CORS?",
    },
    {
        icon: faFileCode,
        title: "Technical Design RFC",
        desc: "Outline an engineering RFC template",
        prompt: "Help me outline a production-ready Technical Design RFC template for a new backend feature.",
    },
];

const MessageList = ({
    messages,
    isLoading,
    onPromptSelect,
    onEditPrompt,
    onRegenerate,
    typingMessageIndex,
    onTypingComplete,
}) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading, typingMessageIndex]);

    if (messages.length === 0 && !isLoading) {
        return (
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 flex flex-col items-center justify-center animate-fade-in">
                <div className="max-w-xl w-full text-center space-y-6">
                    {/* Brand Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] pulse-dot" />
                        <span>Autonomous Cognitive Architecture</span>
                    </div>

                    {/* Logo & Headline */}
                    <div className="space-y-2">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-[var(--accent-gradient)] flex items-center justify-center shadow-md shadow-[var(--accent-glow)] transition-transform duration-300 hover:scale-105">
                            <FontAwesomeIcon icon={faMicrochip} className="text-[var(--accent-text)] text-xl" />
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                            Nexus AI
                        </h2>
                        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                            Precision engineering intelligence for software architecture, code analysis, and technical problem-solving.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-medium pt-1">
                            <a
                                href="https://github.com/GattiHarishKumar"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--accent-primary)] hover:underline"
                            >
                                Architected by Harish Kumar Gatti
                            </a>
                            <span className="text-[var(--text-muted)]">•</span>
                            <a
                                href="mailto:harishkumargatti@gmail.com"
                                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] font-mono text-[10px] transition-colors"
                            >
                                harishkumargatti@gmail.com
                            </a>
                        </div>
                    </div>

                    {/* Starter Suggestions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-left">
                        {SUGGESTIONS.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => onPromptSelect && onPromptSelect(item.prompt)}
                                className="group p-3 rounded-xl bg-[var(--bg-secondary)]/80 hover:bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[var(--accent-border)] transition-all duration-200 text-left cursor-pointer hover:-translate-y-0.5 shadow-xs"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center text-xs">
                                        <FontAwesomeIcon icon={item.icon} />
                                    </div>
                                    <FontAwesomeIcon
                                        icon={faArrowRight}
                                        className="text-[10px] text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100"
                                    />
                                </div>
                                <h3 className="text-xs font-semibold text-[var(--text-primary)] mt-2">
                                    {item.title}
                                </h3>
                                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-2">
                                    {item.desc}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const lastAssistantIdx = messages.reduce((acc, msg, idx) => (msg.role === "assistant" ? idx : acc), -1);

    return (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 max-w-4xl w-full mx-auto">
            {messages.map((msg, index) => {
                const isLatestAssistant = index === lastAssistantIdx;
                const isTyping = index === typingMessageIndex;

                return (
                    <div key={index} className="animate-slide-up">
                        <MessageBubble
                            role={msg.role}
                            content={msg.content}
                            timestamp={msg.createdAt}
                            diagnostics={msg.diagnostics}
                            isLatest={isLatestAssistant}
                            isTyping={isTyping}
                            onTypingComplete={onTypingComplete}
                            onEdit={msg.role === "user" ? onEditPrompt : undefined}
                            onRegenerate={isLatestAssistant ? onRegenerate : undefined}
                        />
                    </div>
                );
            })}

            {isLoading && (
                <div className="flex items-start gap-3 animate-fade-in">
                    <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--accent-gradient)] flex items-center justify-center text-[var(--accent-text)] text-xs shadow-xs">
                        <FontAwesomeIcon icon={faMicrochip} />
                    </div>
                    <div className="px-4 py-3 rounded-xl bg-[var(--bg-bubble-ai)] border border-[var(--border-color)] shadow-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                            <span className="typing-dot" />
                        </div>
                    </div>
                </div>
            )}

            <div ref={bottomRef} className="h-2" />
        </div>
    );
};

export default MessageList;
