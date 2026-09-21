import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faGear,
    faMicrochip,
    faServer,
    faShieldHalved,
    faRotateRight,
    faTrash,
    faUser,
    faBolt,
    faCheck,
    faArrowUpRightFromSquare,
    faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { system } from "../../services/api";

const SettingsModal = ({
    isOpen,
    onClose,
    user,
    activeSessionId,
    onClearChat,
    onExportMarkdown,
    onExportJson,
}) => {
    const [activeTab, setActiveTab] = useState("system");
    const [statusData, setStatusData] = useState(null);
    const [isLoadingStatus, setIsLoadingStatus] = useState(false);
    const [statusError, setStatusError] = useState(null);

    const fetchStatus = async () => {
        setIsLoadingStatus(true);
        setStatusError(null);
        try {
            const res = await system.getStatus();
            setStatusData(res.data);
        } catch {
            setStatusError("Failed to connect to system diagnostics endpoint.");
        } finally {
            setIsLoadingStatus(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchStatus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
            <div
                className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center text-sm border border-[var(--accent-border)]">
                            <FontAwesomeIcon icon={faGear} />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                                System Settings & Diagnostics
                            </h2>
                            <p className="text-[11px] text-[var(--text-muted)]">
                                Nexus AI Cognitive Infrastructure & Configuration
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer"
                        aria-label="Close modal"
                    >
                        <FontAwesomeIcon icon={faXmark} className="text-sm" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-primary)]/40 px-4 pt-2 gap-2">
                    <button
                        onClick={() => setActiveTab("system")}
                        className={`px-3 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === "system"
                                ? "border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold"
                                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faServer} className="text-[10px]" />
                        <span>System Architecture</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("session")}
                        className={`px-3 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === "session"
                                ? "border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold"
                                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faBolt} className="text-[10px]" />
                        <span>Data & Session</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("account")}
                        className={`px-3 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === "account"
                                ? "border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold"
                                : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        }`}
                    >
                        <FontAwesomeIcon icon={faUser} className="text-[10px]" />
                        <span>Account Profile</span>
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Tab 1: System */}
                    {activeTab === "system" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)]">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-[var(--accent-gradient)] flex items-center justify-center text-[var(--accent-text)] text-sm shadow-sm shadow-[var(--accent-glow)]">
                                        <FontAwesomeIcon icon={faMicrochip} />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                                            {statusData?.engine || "Nexus AI Cognitive Engine"}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-0.5">
                                            <a
                                                href="https://github.com/GattiHarishKumar"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[var(--accent-primary)] hover:underline font-medium inline-flex items-center gap-1"
                                            >
                                                <span>Architected by Harish Kumar Gatti</span>
                                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[8px]" />
                                            </a>
                                            <span className="text-[var(--text-muted)]">•</span>
                                            <a
                                                href="mailto:harishkumargatti@gmail.com"
                                                className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] font-mono text-[10px] transition-colors inline-flex items-center gap-1"
                                            >
                                                <FontAwesomeIcon icon={faEnvelope} className="text-[8px]" />
                                                <span>harishkumargatti@gmail.com</span>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                                        {statusData?.status || "ONLINE"}
                                    </span>
                                    <button
                                        onClick={fetchStatus}
                                        disabled={isLoadingStatus}
                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-[var(--border-color)] transition-all cursor-pointer"
                                        title="Refresh diagnostics"
                                    >
                                        <FontAwesomeIcon
                                            icon={faRotateRight}
                                            className={`text-[10px] ${isLoadingStatus ? "animate-spin" : ""}`}
                                        />
                                    </button>
                                </div>
                            </div>

                            {statusError && (
                                <p className="text-xs text-red-400 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                                    {statusError}
                                </p>
                            )}

                            {/* Subsystem Health Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[var(--text-muted)]">LLM Inference</span>
                                        <span className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1">
                                            <FontAwesomeIcon icon={faCheck} className="text-[9px]" /> Active
                                        </span>
                                    </div>
                                    <p className="text-xs font-mono font-medium text-[var(--text-primary)]">
                                        {statusData?.llmModel || "gemini-3.5-flash-lite"}
                                    </p>
                                    <p className="text-[10px] text-[var(--text-muted)]">
                                        Google Gemini Flash Lite engine (1-3s avg latency)
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[var(--text-muted)]">RAG Vector Store</span>
                                        <span
                                            className={`font-semibold text-[11px] flex items-center gap-1 ${
                                                statusData?.qdrantAvailable ? "text-emerald-400" : "text-amber-400"
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="text-[9px]" />{" "}
                                            {statusData?.qdrantAvailable ? "Connected" : "Fallback"}
                                        </span>
                                    </div>
                                    <p className="text-xs font-mono font-medium text-[var(--text-primary)]">
                                        Qdrant :6333 (768-dim)
                                    </p>
                                    <p className="text-[10px] text-[var(--text-muted)]">
                                        Embedding: {statusData?.embeddingModel || "gemini-embedding-001"}
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[var(--text-muted)]">Relational Database</span>
                                        <span
                                            className={`font-semibold text-[11px] flex items-center gap-1 ${
                                                statusData?.mysqlConnected ? "text-emerald-400" : "text-red-400"
                                            }`}
                                        >
                                            <FontAwesomeIcon icon={faCheck} className="text-[9px]" />{" "}
                                            {statusData?.mysqlConnected ? "Connected" : "Disconnected"}
                                        </span>
                                    </div>
                                    <p className="text-xs font-mono font-medium text-[var(--text-primary)]">
                                        MySQL 8.0 (chat)
                                    </p>
                                    <p className="text-[10px] text-[var(--text-muted)]">
                                        HikariCP pool & JPA Hibernate 6
                                    </p>
                                </div>

                                <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[var(--text-muted)]">Security & Limits</span>
                                        <span className="font-semibold text-emerald-400 text-[11px] flex items-center gap-1">
                                            <FontAwesomeIcon icon={faShieldHalved} className="text-[9px]" /> Hardened
                                        </span>
                                    </div>
                                    <p className="text-xs font-mono font-medium text-[var(--text-primary)]">
                                        JWT + Rate Limiter
                                    </p>
                                    <p className="text-[10px] text-[var(--text-muted)]">
                                        Token-bucket per user, BCrypt encryption
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab 2: Session & Storage */}
                    {activeTab === "session" && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-3">
                                <div>
                                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                                        Active Session Control
                                    </h4>
                                    <p className="text-[11px] text-[var(--text-muted)]">
                                        Current Session ID:{" "}
                                        <span className="font-mono text-[var(--text-secondary)]">
                                            {activeSessionId || "None (idle)"}
                                        </span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    <button
                                        onClick={onClearChat}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                                        <span>Clear Active Messages</span>
                                    </button>

                                    <button
                                        onClick={onExportMarkdown}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-border)] transition-all cursor-pointer"
                                    >
                                        Export Markdown (.md)
                                    </button>

                                    <button
                                        onClick={onExportJson}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)] hover:border-[var(--accent-border)] transition-all cursor-pointer"
                                    >
                                        Export JSON (.json)
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-2">
                                <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                                    Local Storage Preferences
                                </h4>
                                <p className="text-[11px] text-[var(--text-muted)]">
                                    Nexus AI stores your selected color palette, dark mode state, and pinned sessions in your browser storage.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Account */}
                    {activeTab === "account" && (
                        <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-3">
                            <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-color)]">
                                <div className="w-10 h-10 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center font-bold text-sm border border-[var(--accent-border)]">
                                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-[var(--text-primary)]">
                                        {user.name || "Authenticated User"}
                                    </h4>
                                    <p className="text-[11px] text-[var(--text-muted)] font-mono">
                                        {user.email || "user@example.com"}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-xs">
                                <div className="flex justify-between py-1 border-b border-[var(--border-color)]/60">
                                    <span className="text-[var(--text-muted)]">Authentication Type</span>
                                    <span className="font-mono text-[var(--text-primary)]">Stateless JWT (HMAC-SHA512)</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-[var(--border-color)]/60">
                                    <span className="text-[var(--text-muted)]">Client UI Version</span>
                                    <span className="font-mono text-[var(--text-primary)]">v2.4.0 (React 19)</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-[var(--border-color)]/60">
                                    <span className="text-[var(--text-muted)]">System Architect</span>
                                    <a
                                        href="https://github.com/GattiHarishKumar"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-medium text-[var(--accent-primary)] hover:underline inline-flex items-center gap-1"
                                    >
                                        <span>Harish Kumar Gatti</span>
                                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[8px]" />
                                    </a>
                                </div>
                                <div className="flex justify-between py-1.5">
                                    <span className="text-[var(--text-muted)]">Author Contact</span>
                                    <a
                                        href="mailto:harishkumargatti@gmail.com"
                                        className="font-mono text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                                    >
                                        harishkumargatti@gmail.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--bg-elevated)]/30 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>Nexus AI Core Infrastructure</span>
                    <button
                        onClick={onClose}
                        className="px-3.5 py-1.5 rounded-lg bg-[var(--accent-primary)] text-[var(--accent-text)] font-medium hover:opacity-90 transition-opacity cursor-pointer text-xs"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
