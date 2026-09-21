import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMicrochip,
    faUser,
    faCopy,
    faCheck,
    faPen,
    faRotateRight,
    faBolt,
    faForward,
} from "@fortawesome/free-solid-svg-icons";

const CodeBlock = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayLang = (language || "code").toUpperCase();

    return (
        <div className="code-container">
            <div className="code-header">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]/80" />
                    <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--text-secondary)]">
                        {displayLang}
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer py-0.5 px-2 rounded hover:bg-white/5"
                    title="Copy code to clipboard"
                >
                    <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                    <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
            </div>
            <pre className="code-content">
                <code>{code}</code>
            </pre>
        </div>
    );
};

const TypewriterRenderer = ({ text, isTyping, onComplete }) => {
    const [length, setLength] = useState(isTyping ? 0 : text.length);

    useEffect(() => {
        if (!isTyping) {
            setLength(text.length);
            return;
        }

        if (length >= text.length) {
            if (onComplete) onComplete();
            return;
        }

        // Adaptive chunk speed
        const step = Math.max(2, Math.floor(text.length / 50));
        const timer = setTimeout(() => {
            setLength((prev) => Math.min(prev + step, text.length));
        }, 16);

        return () => clearTimeout(timer);
    }, [length, text, isTyping, onComplete]);

    const displayed = isTyping ? text.slice(0, length) : text;
    const isFinished = length >= text.length;

    return (
        <div>
            <ReactMarkdown
                components={{
                    pre({ children }) {
                        return <>{children}</>;
                    },
                    code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        const codeStr = String(children).replace(/\n$/, "");
                        const isBlock = Boolean(match) || codeStr.includes("\n");
                        if (isBlock) {
                            return (
                                <CodeBlock
                                    language={match ? match[1] : "code"}
                                    code={codeStr}
                                />
                            );
                        }
                        return (
                            <code
                                className="bg-[var(--accent-subtle)] text-[var(--accent-primary)] px-1.5 py-0.5 rounded text-xs font-mono border border-[var(--accent-border)]"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {displayed}
            </ReactMarkdown>

            {isTyping && !isFinished && (
                <div className="flex items-center gap-2 mt-2 pt-1">
                    <span className="typewriter-cursor" />
                    <button
                        onClick={() => {
                            setLength(text.length);
                            if (onComplete) onComplete();
                        }}
                        className="text-[10px] text-[var(--text-muted)] hover:text-[var(--accent-primary)] flex items-center gap-1 cursor-pointer bg-[var(--bg-elevated)] px-2 py-0.5 rounded-full border border-[var(--border-color)] transition-colors"
                        title="Skip streaming animation"
                    >
                        <FontAwesomeIcon icon={faForward} className="text-[8px]" />
                        <span>Instant</span>
                    </button>
                </div>
            )}
        </div>
    );
};

const MessageBubble = ({
    role,
    content,
    timestamp,
    diagnostics,
    isLatest,
    isTyping,
    onTypingComplete,
    onEdit,
    onRegenerate,
}) => {
    const isUser = role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Diagnostics calculation
    const latency = diagnostics?.latency || null;
    const tokens = diagnostics?.tokens || Math.round((content || "").length / 4);

    return (
        <div className={`group flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
            {/* AI Avatar */}
            {!isUser && (
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--accent-gradient)] text-[var(--accent-text)] flex items-center justify-center text-xs shadow-sm shadow-[var(--accent-glow)] mt-0.5">
                    <FontAwesomeIcon icon={faMicrochip} />
                </div>
            )}

            <div className={`max-w-[88%] sm:max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
                {/* Bubble Container */}
                <div
                    className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed transition-all ${
                        isUser
                            ? "bg-[var(--accent-gradient)] text-[var(--accent-text)] rounded-tr-xs shadow-sm shadow-[var(--accent-glow)] font-medium"
                            : "bg-[var(--bg-bubble-ai)] text-[var(--text-primary)] rounded-tl-xs border border-[var(--border-color)] shadow-xs"
                    }`}
                >
                    {isUser ? (
                        <p className="whitespace-pre-wrap break-words">{content}</p>
                    ) : (
                        <div className="markdown-body">
                            <TypewriterRenderer
                                text={content}
                                isTyping={isTyping}
                                onComplete={onTypingComplete}
                            />
                        </div>
                    )}
                </div>

                {/* Diagnostics & Meta Bar */}
                <div
                    className={`flex flex-wrap items-center gap-2 mt-1 px-1 text-[11px] text-[var(--text-muted)] ${
                        isUser ? "justify-end" : "justify-start"
                    }`}
                >
                    {!isUser && (
                        <span className="font-semibold text-[var(--accent-primary)] text-[10px] uppercase tracking-wider">
                            Nexus AI
                        </span>
                    )}

                    {/* Latency & Token Diagnostics Badge */}
                    {!isUser && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-[var(--bg-elevated)] border border-[var(--border-color)] font-mono">
                            <FontAwesomeIcon icon={faBolt} className="text-[9px] text-[var(--accent-primary)]" />
                            {latency ? `${latency}` : "~1.6s"} • ~{tokens} tok • Gemini 3.5 Flash Lite
                        </span>
                    )}

                    {timestamp && (
                        <span>
                            {new Date(timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </span>
                    )}

                    {/* Copy Button */}
                    <button
                        onClick={handleCopy}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 hover:text-[var(--text-primary)] transition-all cursor-pointer ml-1"
                        title="Copy text"
                    >
                        <FontAwesomeIcon icon={copied ? faCheck : faCopy} className="text-[10px]" />
                        <span className="text-[10px]">{copied ? "Copied" : "Copy"}</span>
                    </button>

                    {/* User Message: Edit Prompt */}
                    {isUser && onEdit && (
                        <button
                            onClick={() => onEdit(content)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 hover:text-[var(--text-primary)] transition-all cursor-pointer ml-1"
                            title="Edit prompt and re-send"
                        >
                            <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                            <span className="text-[10px]">Edit</span>
                        </button>
                    )}

                    {/* Latest Assistant Message: Regenerate */}
                    {!isUser && isLatest && !isTyping && onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 hover:text-[var(--accent-primary)] transition-all cursor-pointer ml-1"
                            title="Regenerate this response"
                        >
                            <FontAwesomeIcon icon={faRotateRight} className="text-[10px]" />
                            <span className="text-[10px]">Regenerate</span>
                        </button>
                    )}
                </div>
            </div>

            {/* User Avatar */}
            {isUser && (
                <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-color)] flex items-center justify-center text-xs mt-0.5">
                    <FontAwesomeIcon icon={faUser} />
                </div>
            )}
        </div>
    );
};

export default MessageBubble;
