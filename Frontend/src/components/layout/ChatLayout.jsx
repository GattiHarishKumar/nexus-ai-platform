import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMicrochip,
    faSignOutAlt,
    faSun,
    faMoon,
    faBars,
    faPalette,
    faCheck,
    faDownload,
    faGear,
    faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import { chat, skills as skillsApi } from "../../services/api";
import SessionSidebar from "../chat/SessionSidebar";
import SkillPicker from "../chat/SkillPicker";
import MessageList from "../chat/MessageList";
import ChatInput from "../chat/ChatInput";
import PromptTemplatesModal from "../chat/PromptTemplatesModal";
import SettingsModal from "../chat/SettingsModal";

const PALETTES = [
    { id: "sunburst", name: "Sunburst Midnight", color: "#f8c61e", secondary: "#252c37" },
    { id: "netflix", name: "Netflix Red", color: "#e50914", secondary: "#b81d24" },
    { id: "teal", name: "Obsidian Teal", color: "#06b6d4", secondary: "#10b981" },
    { id: "blue", name: "Sapphire Cobalt", color: "#3b82f6", secondary: "#6366f1" },
    { id: "amber", name: "Titanium Amber", color: "#f59e0b", secondary: "#ea580c" },
    { id: "violet", name: "Cyber Violet", color: "#8b5cf6", secondary: "#ec4899" },
    { id: "zinc", name: "Minimal Zinc", color: "#e4e4e7", secondary: "#71717a" },
];

const ChatLayout = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [skillList, setSkillList] = useState([]);
    const [activeSkill, setActiveSkill] = useState("general");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem("nexus-theme");
        return saved !== null ? saved === "dark" : true;
    });
    const [palette, setPalette] = useState(() => {
        return localStorage.getItem("nexus-palette") || "sunburst";
    });
    const [showPaletteMenu, setShowPaletteMenu] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [showTemplatesModal, setShowTemplatesModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [typingMessageIndex, setTypingMessageIndex] = useState(null);

    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
        localStorage.setItem("nexus-theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    useEffect(() => {
        document.documentElement.setAttribute("data-palette", palette);
        localStorage.setItem("nexus-palette", palette);
    }, [palette]);

    const loadSessions = useCallback(async () => {
        try {
            const res = await chat.listSessions();
            setSessions(res.data);
        } catch {
            toast.error("Failed to load sessions");
        }
    }, []);

    const loadSkills = useCallback(async () => {
        try {
            const res = await skillsApi.list();
            setSkillList(res.data);
        } catch {
            toast.error("Failed to load skills");
        }
    }, []);

    useEffect(() => {
        loadSessions();
        loadSkills();
    }, [loadSessions, loadSkills]);

    const loadHistory = async (sessionId) => {
        try {
            setTypingMessageIndex(null);
            const res = await chat.getHistory(sessionId);
            setMessages(res.data);
        } catch {
            toast.error("Failed to load chat history");
        }
    };

    const handleSelectSession = (sessionId) => {
        setActiveSessionId(sessionId);
        loadHistory(sessionId);
        setSidebarCollapsed(true);
    };

    const handleNewChat = async () => {
        try {
            const res = await chat.createSession();
            const newSession = res.data;
            setActiveSessionId(newSession.sessionId);
            setMessages([]);
            setTypingMessageIndex(null);
            await loadSessions();
            setSidebarCollapsed(true);
        } catch {
            toast.error("Failed to create new chat");
        }
    };

    const handleDeleteSession = async (sessionId) => {
        try {
            await chat.deleteSession(sessionId);
            if (activeSessionId === sessionId) {
                setActiveSessionId(null);
                setMessages([]);
            }
            await loadSessions();
            toast.success("Chat deleted");
        } catch {
            toast.error("Failed to delete chat");
        }
    };

    const handleSend = async (overrideText) => {
        const textToSend = typeof overrideText === "string" ? overrideText : input;
        if (!textToSend.trim() || isLoading) return;

        const userMessage = textToSend.trim();
        setInput("");
        setIsLoading(true);

        const optimisticMsg = {
            role: "user",
            content: userMessage,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMsg]);

        const startTime = performance.now();

        try {
            const res = await chat.ask({
                message: userMessage,
                sessionId: activeSessionId,
                skill: activeSkill,
            });

            const latencySec = ((performance.now() - startTime) / 1000).toFixed(2);
            const { answer, sessionId } = res.data;

            if (!activeSessionId) {
                setActiveSessionId(sessionId);
            }

            const estimatedTokens = Math.round((userMessage.length + answer.length) / 4);

            setMessages((prev) => {
                const newAssistantMsg = {
                    role: "assistant",
                    content: answer,
                    createdAt: new Date().toISOString(),
                    diagnostics: {
                        latency: `${latencySec}s`,
                        tokens: estimatedTokens,
                        model: "Gemini 3.5 Flash Lite",
                    },
                };
                const updated = [...prev, newAssistantMsg];
                // Activate typing animation for this freshly arrived message
                setTypingMessageIndex(updated.length - 1);
                return updated;
            });

            await loadSessions();
        } catch (err) {
            setMessages((prev) => prev.filter((m) => m !== optimisticMsg));
            const msg = err.response?.data || "Failed to send message";
            toast.error(typeof msg === "string" ? msg : "Failed to send message");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditPrompt = (promptText) => {
        setInput(promptText);
        toast("Prompt copied to editor", { icon: "✏️", duration: 1500 });
    };

    const handleRegenerate = () => {
        // Find last user message
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === "user") {
                handleSend(messages[i].content);
                return;
            }
        }
        toast.error("No previous user message to regenerate");
    };

    const handleClearChat = () => {
        setMessages([]);
        setTypingMessageIndex(null);
        setShowSettingsModal(false);
        toast.success("Chat display cleared");
    };

    // Export conversation as Markdown
    const handleExportMarkdown = () => {
        if (messages.length === 0) {
            toast.error("No messages to export");
            return;
        }

        const dateStr = new Date().toLocaleString();
        let md = `# Nexus AI Conversation Log\n\n`;
        md += `* **Export Date:** ${dateStr}\n`;
        md += `* **Session ID:** \`${activeSessionId || "unassigned"}\`\n`;
        md += `* **Engine:** Nexus AI Cognitive Engine v2.4 (Gemini 3.5 Flash Lite)\n`;
        md += `* **Lead Systems Architect:** Harish Kumar Gatti ([GitHub](https://github.com/GattiHarishKumar) | [Email](mailto:harishkumargatti@gmail.com))\n\n`;
        md += `---\n\n`;

        messages.forEach((msg) => {
            const roleName = msg.role === "user" ? "👤 User" : "🤖 Nexus AI";
            const time = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : "";
            md += `### ${roleName} ${time ? `(${time})` : ""}\n\n`;
            md += `${msg.content}\n\n`;
            if (msg.diagnostics) {
                md += `> *Inference: ${msg.diagnostics.latency} • ~${msg.diagnostics.tokens} tokens*\n\n`;
            }
            md += `---\n\n`;
        });

        md += `*Exported from Nexus AI • Architected by Harish Kumar Gatti (https://github.com/GattiHarishKumar)*\n`;

        const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nexus-chat-${activeSessionId ? activeSessionId.slice(0, 8) : "session"}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
        toast.success("Exported conversation as Markdown (.md)");
    };

    // Export conversation as JSON
    const handleExportJson = () => {
        if (messages.length === 0) {
            toast.error("No messages to export");
            return;
        }

        const exportData = {
            application: "Nexus AI Cognitive Engine",
            version: "v2.4.0 Core",
            author: {
                name: "Harish Kumar Gatti",
                email: "harishkumargatti@gmail.com",
                github: "https://github.com/GattiHarishKumar",
            },
            leadArchitect: "Harish Kumar Gatti",
            exportTimestamp: new Date().toISOString(),
            sessionId: activeSessionId,
            messageCount: messages.length,
            messages: messages.map((m) => ({
                role: m.role,
                content: m.content,
                createdAt: m.createdAt,
                diagnostics: m.diagnostics || null,
            })),
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json;charset=utf-8",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `nexus-chat-${activeSessionId ? activeSessionId.slice(0, 8) : "session"}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowExportMenu(false);
        toast.success("Exported conversation as JSON (.json)");
    };

    const handleLogout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "var(--bg-elevated)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-color)",
                        fontSize: "0.85rem",
                    },
                }}
            />

            {/* Prompt Templates Modal */}
            <PromptTemplatesModal
                isOpen={showTemplatesModal}
                onClose={() => setShowTemplatesModal(false)}
                onSelectTemplate={(tplPrompt) => {
                    setInput(tplPrompt);
                    toast.success("Template inserted into prompt");
                }}
            />

            {/* Settings & System Diagnostics Modal */}
            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
                user={user}
                activeSessionId={activeSessionId}
                onClearChat={handleClearChat}
                onExportMarkdown={handleExportMarkdown}
                onExportJson={handleExportJson}
            />

            <SessionSidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelect={handleSelectSession}
                onNewChat={handleNewChat}
                onDelete={handleDeleteSession}
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                userId={user.id || user.email}
            />

            <div className="flex flex-col flex-1 min-w-0 h-full relative">
                {/* Header */}
                <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/90 backdrop-blur-md z-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                            aria-label="Toggle sidebar"
                        >
                            <FontAwesomeIcon icon={faBars} className="text-sm" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--accent-gradient)] flex items-center justify-center shadow-sm shadow-[var(--accent-glow)] transition-transform duration-200 hover:scale-105">
                                <FontAwesomeIcon icon={faMicrochip} className="text-[var(--accent-text)] text-sm" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                                        Nexus AI
                                    </h1>
                                    <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-border)]">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] pulse-dot" />
                                        v2.4 Core
                                    </span>
                                </div>
                                <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[200px] sm:max-w-none">
                                    {user.name ? `Session for ${user.name}` : "Engineering Intelligence Assistant"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* Prompt Templates Quick Button */}
                        <button
                            onClick={() => setShowTemplatesModal(true)}
                            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer"
                            title="Engineering Prompt Library"
                        >
                            <FontAwesomeIcon icon={faLayerGroup} className="text-xs text-[var(--accent-primary)]" />
                            <span>Templates</span>
                        </button>

                        {/* Export Menu Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer"
                                title="Export conversation"
                            >
                                <FontAwesomeIcon icon={faDownload} className="text-xs" />
                                <span className="hidden md:inline">Export</span>
                            </button>

                            {showExportMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setShowExportMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl glass-elevated p-1.5 z-40 animate-scale-in">
                                        <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 mb-1">
                                            Export Format
                                        </div>
                                        <button
                                            onClick={handleExportMarkdown}
                                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                                        >
                                            <span>Markdown (.md)</span>
                                            <span className="text-[10px] text-[var(--accent-primary)] font-mono">MD</span>
                                        </button>
                                        <button
                                            onClick={handleExportJson}
                                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                                        >
                                            <span>JSON (.json)</span>
                                            <span className="text-[10px] text-[var(--accent-primary)] font-mono">JSON</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Palette Picker Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowPaletteMenu(!showPaletteMenu)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer"
                                title="Change Color Palette"
                            >
                                <FontAwesomeIcon icon={faPalette} className="text-xs" />
                                <span className="hidden md:inline">Theme</span>
                                <span
                                    className="w-2.5 h-2.5 rounded-full border border-white/20 ml-0.5"
                                    style={{
                                        background: PALETTES.find((p) => p.id === palette)?.color || "#f8c61e",
                                    }}
                                />
                            </button>

                            {showPaletteMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setShowPaletteMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-48 rounded-xl glass-elevated p-2 z-40 animate-scale-in">
                                        <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 mb-1">
                                            Color Palette
                                        </div>
                                        {PALETTES.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setPalette(p.id);
                                                    setShowPaletteMenu(false);
                                                }}
                                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                                                    palette === p.id
                                                        ? "bg-[var(--accent-subtle)] text-[var(--accent-primary)] font-medium"
                                                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                                                        style={{
                                                            background: `linear-gradient(135deg, ${p.color}, ${p.secondary})`,
                                                        }}
                                                    />
                                                    <span>{p.name}</span>
                                                </div>
                                                {palette === p.id && (
                                                    <FontAwesomeIcon icon={faCheck} className="text-[10px]" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Dark / Light Mode */}
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer"
                            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            <FontAwesomeIcon icon={darkMode ? faSun : faMoon} className="text-xs" />
                        </button>

                        {/* System Health / Settings Button */}
                        <button
                            onClick={() => setShowSettingsModal(true)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border-color)] transition-all cursor-pointer"
                            title="System Settings & Diagnostics"
                        >
                            <FontAwesomeIcon icon={faGear} className="text-xs" />
                        </button>

                        <div className="h-4 w-[1px] bg-[var(--border-color)] mx-0.5 sm:mx-1" />

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-400/90 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                            title="Sign out"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="text-xs" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </header>

                {/* Skill Selector */}
                <SkillPicker
                    skills={skillList}
                    activeSkill={activeSkill}
                    onSelect={setActiveSkill}
                    disabled={isLoading}
                />

                {/* Message Canvas */}
                <MessageList
                    messages={messages}
                    isLoading={isLoading}
                    onPromptSelect={(text) => handleSend(text)}
                    onEditPrompt={handleEditPrompt}
                    onRegenerate={handleRegenerate}
                    typingMessageIndex={typingMessageIndex}
                    onTypingComplete={() => setTypingMessageIndex(null)}
                />

                {/* Input Bar */}
                <ChatInput
                    value={input}
                    onChange={setInput}
                    onSend={handleSend}
                    disabled={isLoading}
                    onOpenTemplates={() => setShowTemplatesModal(true)}
                />
            </div>
        </div>
    );
};

export default ChatLayout;
