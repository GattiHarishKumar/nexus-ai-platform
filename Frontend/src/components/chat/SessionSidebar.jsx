import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faTrash,
    faComments,
    faChevronLeft,
    faTerminal,
    faMicrochip,
    faMagnifyingGlass,
    faXmark,
    faThumbtack,
    faPen,
    faCheck,
    faArrowUpRightFromSquare,
    faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

const SessionSidebar = ({
    sessions,
    activeSessionId,
    onSelect,
    onNewChat,
    onDelete,
    collapsed,
    onToggle,
    userId,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [editTitleValue, setEditTitleValue] = useState("");

    // Local customizations: { [sessionId]: { pinned: boolean, title: string } }
    const storageKey = `nexus_session_meta_${userId || "default"}`;
    const [customizations, setCustomizations] = useState(() => {
        try {
            const raw = localStorage.getItem(storageKey);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(storageKey, JSON.stringify(customizations));
        } catch {
            // Ignore quota errors
        }
    }, [customizations, storageKey]);

    const togglePin = (sessionId, e) => {
        e.stopPropagation();
        setCustomizations((prev) => {
            const existing = prev[sessionId] || {};
            return {
                ...prev,
                [sessionId]: {
                    ...existing,
                    pinned: !existing.pinned,
                },
            };
        });
    };

    const startEditing = (session, e) => {
        e.stopPropagation();
        setEditingSessionId(session.sessionId);
        setEditTitleValue(customizations[session.sessionId]?.title || session.title || "Untitled Session");
    };

    const saveEditing = (sessionId, e) => {
        if (e) e.stopPropagation();
        if (editTitleValue.trim()) {
            setCustomizations((prev) => ({
                ...prev,
                [sessionId]: {
                    ...(prev[sessionId] || {}),
                    title: editTitleValue.trim(),
                },
            }));
        }
        setEditingSessionId(null);
    };

    const cancelEditing = (e) => {
        if (e) e.stopPropagation();
        setEditingSessionId(null);
    };

    // Filter & sort sessions
    const { pinnedList, unpinnedList } = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        const enhanced = sessions.map((s) => {
            const meta = customizations[s.sessionId] || {};
            const displayTitle = meta.title || s.title || "Untitled Session";
            const isPinned = Boolean(meta.pinned);
            return {
                ...s,
                displayTitle,
                isPinned,
            };
        });

        const filtered = enhanced.filter((s) =>
            !query ? true : s.displayTitle.toLowerCase().includes(query)
        );

        const pinned = filtered.filter((s) => s.isPinned);
        const unpinned = filtered.filter((s) => !s.isPinned);

        return { pinnedList: pinned, unpinnedList: unpinned };
    }, [sessions, customizations, searchQuery]);

    const renderSessionItem = (session) => {
        const isActive = activeSessionId === session.sessionId;
        const isEditing = editingSessionId === session.sessionId;

        return (
            <div
                key={session.sessionId}
                onClick={() => onSelect(session.sessionId)}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 ${
                    isActive
                        ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--accent-border)] shadow-sm"
                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]/60 hover:text-[var(--text-primary)] border border-transparent"
                }`}
            >
                {/* Active Left Indicator */}
                {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r bg-[var(--accent-primary)] shadow-sm shadow-[var(--accent-glow)]" />
                )}

                <FontAwesomeIcon
                    icon={session.isPinned ? faThumbtack : faComments}
                    className={`text-xs flex-shrink-0 transition-opacity ${
                        session.isPinned
                            ? "text-[var(--accent-primary)]"
                            : isActive
                            ? "text-[var(--accent-primary)] opacity-100"
                            : "opacity-40 group-hover:opacity-75"
                    }`}
                />

                {isEditing ? (
                    <div
                        className="flex-1 flex items-center gap-1 min-w-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <input
                            type="text"
                            value={editTitleValue}
                            onChange={(e) => setEditTitleValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") saveEditing(session.sessionId, e);
                                if (e.key === "Escape") cancelEditing(e);
                            }}
                            autoFocus
                            className="flex-1 bg-[var(--bg-primary)] text-xs text-[var(--text-primary)] px-2 py-1 rounded border border-[var(--accent-border)] focus:outline-none"
                        />
                        <button
                            onClick={(e) => saveEditing(session.sessionId, e)}
                            className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors text-xs"
                            title="Save title"
                        >
                            <FontAwesomeIcon icon={faCheck} />
                        </button>
                        <button
                            onClick={cancelEditing}
                            className="p-1 text-[var(--text-muted)] hover:text-red-400 transition-colors text-xs"
                            title="Cancel"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                ) : (
                    <span className="flex-1 text-xs truncate font-medium">
                        {session.displayTitle}
                    </span>
                )}

                {/* Session Action Buttons */}
                {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                        {/* Pin Button */}
                        <button
                            onClick={(e) => togglePin(session.sessionId, e)}
                            className={`p-1 rounded hover:bg-[var(--bg-primary)] transition-all text-xs ${
                                session.isPinned
                                    ? "text-[var(--accent-primary)]"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            }`}
                            title={session.isPinned ? "Unpin session" : "Pin session"}
                        >
                            <FontAwesomeIcon icon={faThumbtack} className="text-[10px]" />
                        </button>

                        {/* Rename Button */}
                        <button
                            onClick={(e) => startEditing(session, e)}
                            className="p-1 rounded hover:bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-xs"
                            title="Rename session"
                        >
                            <FontAwesomeIcon icon={faPen} className="text-[10px]" />
                        </button>

                        {/* Delete Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(session.sessionId);
                            }}
                            className="p-1 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs"
                            title="Delete session"
                        >
                            <FontAwesomeIcon icon={faTrash} className="text-[10px]" />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            <aside
                className={`${
                    collapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
                } fixed lg:relative z-40 w-72 h-full bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col transition-transform duration-250 ease-out`}
            >
                {/* Sidebar Header & New Chat Button */}
                <div className="p-3 border-b border-[var(--border-color)] space-y-2">
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={onNewChat}
                            className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--accent-gradient)] text-[var(--accent-text)] text-xs font-semibold hover:opacity-95 active:scale-[0.98] transition-all shadow-sm shadow-[var(--accent-glow)] cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-[11px]" />
                            <span>New Session</span>
                        </button>

                        <button
                            onClick={onToggle}
                            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors"
                            aria-label="Close sidebar"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                        </button>
                    </div>

                    {/* Session Search Input */}
                    <div className="relative flex items-center">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-2.5 text-[11px] text-[var(--text-muted)] pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter sessions..."
                            className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-border)] transition-colors"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 cursor-pointer"
                                title="Clear search"
                            >
                                <FontAwesomeIcon icon={faXmark} className="text-[10px]" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Session List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {sessions.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-10 h-10 mx-auto rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] mb-3">
                                <FontAwesomeIcon icon={faTerminal} className="text-sm opacity-60" />
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] font-medium">No sessions yet</p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-1">
                                Launch a new chat to begin prompting
                            </p>
                        </div>
                    ) : pinnedList.length === 0 && unpinnedList.length === 0 ? (
                        <div className="text-center py-8 px-3">
                            <p className="text-xs text-[var(--text-muted)]">No sessions match &quot;{searchQuery}&quot;</p>
                            <button
                                onClick={() => setSearchQuery("")}
                                className="mt-2 text-xs text-[var(--accent-primary)] hover:underline cursor-pointer"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Pinned Section */}
                            {pinnedList.length > 0 && (
                                <div className="space-y-0.5 mb-2">
                                    <div className="flex items-center justify-between px-2.5 py-1 text-[10px] font-semibold text-[var(--accent-primary)] uppercase tracking-wider">
                                        <span>Pinned ({pinnedList.length})</span>
                                        <FontAwesomeIcon icon={faThumbtack} className="text-[9px]" />
                                    </div>
                                    {pinnedList.map(renderSessionItem)}
                                </div>
                            )}

                            {/* Recent Section */}
                            <div className="space-y-0.5">
                                <div className="px-2.5 py-1 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                    Recent Sessions ({unpinnedList.length})
                                </div>
                                {unpinnedList.map(renderSessionItem)}
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar Footer */}
                <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
                    <div className="p-2.5 rounded-xl bg-[var(--bg-primary)]/80 border border-[var(--border-color)] space-y-1.5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent-primary)] text-[10px] border border-[var(--accent-border)]">
                                    <FontAwesomeIcon icon={faMicrochip} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-[var(--text-primary)] leading-tight">
                                        Harish Kumar Gatti
                                    </p>
                                    <p className="text-[9px] text-[var(--text-muted)]">
                                        Lead Systems Architect
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)]/50 text-[9px]">
                            <a
                                href="https://github.com/GattiHarishKumar"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[var(--accent-primary)] hover:underline font-medium"
                                title="GitHub: https://github.com/GattiHarishKumar"
                            >
                                <span>GitHub Profile</span>
                                <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[8px]" />
                            </a>
                            <a
                                href="mailto:harishkumargatti@gmail.com"
                                className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                                title="Email: harishkumargatti@gmail.com"
                            >
                                <FontAwesomeIcon icon={faEnvelope} className="text-[8px]" />
                                <span>Email</span>
                            </a>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Backdrop Overlay */}
            {!collapsed && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden animate-fade-in"
                    onClick={onToggle}
                />
            )}
        </>
    );
};

export default SessionSidebar;
