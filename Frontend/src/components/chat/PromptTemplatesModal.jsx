import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faXmark,
    faMagnifyingGlass,
    faCode,
    faDatabase,
    faShieldHalved,
    faLayerGroup,
    faServer,
    faArrowRight,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";

const CATEGORIES = [
    { id: "all", name: "All Templates", icon: faLayerGroup },
    { id: "architecture", name: "Architecture", icon: faServer },
    { id: "security", name: "API Security", icon: faShieldHalved },
    { id: "database", name: "Databases & SQL", icon: faDatabase },
    { id: "clean_code", name: "Code & Refactor", icon: faCode },
];

const TEMPLATES = [
    {
        id: "arch-monolith",
        category: "architecture",
        title: "Modular Monolith vs Microservices",
        desc: "Evaluate architectural tradeoffs, latency, and operational boundaries for high-throughput systems.",
        prompt: "Analyze the architectural tradeoffs between a modular monolith and microservices for a platform handling 15,000 req/s. Detail data consistency patterns (Saga vs 2PC), deployment complexity, and team velocity.",
    },
    {
        id: "arch-kafka",
        category: "architecture",
        title: "Event-Driven Pipeline with Kafka",
        desc: "Design an asynchronous event architecture with idempotent consumers and outbox pattern.",
        prompt: "Design an event-driven messaging architecture using Apache Kafka, Spring Boot, and PostgreSQL. Provide solutions for idempotent consumer handling, dead-letter queues, and the Transactional Outbox pattern.",
    },
    {
        id: "arch-cache",
        category: "architecture",
        title: "Multi-Tier Caching Blueprint",
        desc: "L1 in-memory (Caffeine) + L2 distributed (Redis) cache design with invalidation strategies.",
        prompt: "Provide an architectural blueprint for a multi-tier caching system using L1 local cache (Caffeine) and L2 distributed cache (Redis). Include cache-aside, write-through, and stampede prevention patterns.",
    },
    {
        id: "sec-jwt",
        category: "security",
        title: "Spring Boot JWT & RBAC Hardening",
        desc: "Security checklist for stateless JWT authentication, token refresh, and CORS.",
        prompt: "Review and provide a production hardening checklist for Spring Boot 3 REST APIs utilizing stateless JWT authentication, role-based access control (RBAC), bcrypt password hashing, and secure HTTP headers.",
    },
    {
        id: "sec-owasp",
        category: "security",
        title: "OWASP API Top 10 Security Audit",
        desc: "Identify and mitigate Broken Object Level Authorization, SSRF, and injection vectors.",
        prompt: "Perform a comprehensive audit checklist based on the OWASP API Security Top 10. For each vulnerability, explain how to test for it and implement defenses in modern web applications.",
    },
    {
        id: "db-indexes",
        category: "database",
        title: "MySQL 8 Index Tuning & EXPLAIN",
        desc: "Composite index design, index selectivity, and query execution plan diagnostics.",
        prompt: "Explain how to optimize slow MySQL 8.0 queries using EXPLAIN ANALYZE. Cover composite B-Tree index ordering (equality then range), covering indexes, and resolving filesort / temporary table bottlenecks.",
    },
    {
        id: "db-deadlocks",
        category: "database",
        title: "HikariCP & Deadlock Prevention",
        desc: "Tune connection pooling and eliminate transaction deadlocks in high concurrency.",
        prompt: "How should HikariCP connection pool parameters (maximumPoolSize, connectionTimeout, idleTimeout) be calculated for a Spring Boot service? How do you prevent and recover from database transaction deadlocks under heavy concurrent writes?",
    },
    {
        id: "code-clean",
        category: "clean_code",
        title: "Clean Architecture Refactoring",
        desc: "Refactor coupled service logic into domain entities, use cases, and interfaces.",
        prompt: "Walk me through refactoring tightly-coupled business logic into Clean Architecture principles. Separate domain entities, use-case interactors, repository interfaces, and web controllers with clean dependency injection.",
    },
    {
        id: "code-concurrency",
        category: "clean_code",
        title: "Java Concurrency & Thread-Safety",
        desc: "Identify race conditions, memory visibility issues, and lock contention.",
        prompt: "What are the most common subtle multithreading bugs in Java? Detail the memory model semantics of volatile, atomic references, thread-safe collections (ConcurrentHashMap), and ReentrantReadWriteLock.",
    },
];

const PromptTemplatesModal = ({ isOpen, onClose, onSelectTemplate }) => {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedId, setCopiedId] = useState(null);

    if (!isOpen) return null;

    const filtered = TEMPLATES.filter((tpl) => {
        const matchesCat = selectedCategory === "all" || tpl.category === selectedCategory;
        const matchesQuery =
            !searchQuery.trim() ||
            tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tpl.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tpl.prompt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesQuery;
    });

    const handleApply = (tpl) => {
        onSelectTemplate(tpl.prompt);
        setCopiedId(tpl.id);
        setTimeout(() => {
            setCopiedId(null);
            onClose();
        }, 300);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in">
            <div
                className="relative w-full max-w-3xl max-h-[85vh] flex flex-col rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-2xl overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-[var(--bg-elevated)]/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] text-[var(--accent-primary)] flex items-center justify-center text-sm border border-[var(--accent-border)]">
                            <FontAwesomeIcon icon={faLayerGroup} />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                                Engineering Prompt Library
                            </h2>
                            <p className="text-[11px] text-[var(--text-muted)]">
                                Production-grade engineering templates for architecture, security, and databases
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

                {/* Filter & Search Bar */}
                <div className="p-4 border-b border-[var(--border-color)] space-y-3 bg-[var(--bg-primary)]/40">
                    {/* Search Input */}
                    <div className="relative flex items-center">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-3 text-xs text-[var(--text-muted)]"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search prompt templates by topic or keyword..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                        />
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                                    selectedCategory === cat.id
                                        ? "bg-[var(--accent-primary)] text-[var(--accent-text)] shadow-xs"
                                        : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
                                }`}
                            >
                                <FontAwesomeIcon icon={cat.icon} className="text-[10px]" />
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Template Cards List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                    {filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-xs text-[var(--text-secondary)]">No matching templates found</p>
                            <p className="text-[11px] text-[var(--text-muted)] mt-1">Try another search term</p>
                        </div>
                    ) : (
                        filtered.map((tpl) => {
                            const isApplied = copiedId === tpl.id;
                            return (
                                <div
                                    key={tpl.id}
                                    onClick={() => handleApply(tpl)}
                                    className="group p-3.5 rounded-xl bg-[var(--bg-primary)]/80 hover:bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[var(--accent-border)] transition-all cursor-pointer flex items-start justify-between gap-3 shadow-xs hover:-translate-y-0.5"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--accent-border)]">
                                                {tpl.category}
                                            </span>
                                            <h3 className="text-xs font-semibold text-[var(--text-primary)] truncate">
                                                {tpl.title}
                                            </h3>
                                        </div>
                                        <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-1">
                                            {tpl.desc}
                                        </p>
                                        <p className="text-[11px] text-[var(--text-muted)] mt-1.5 font-mono line-clamp-2 bg-[var(--bg-secondary)] p-2 rounded-lg border border-[var(--border-color)]">
                                            {tpl.prompt}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleApply(tpl);
                                        }}
                                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                            isApplied
                                                ? "bg-emerald-500 text-white"
                                                : "bg-[var(--bg-elevated)] group-hover:bg-[var(--accent-primary)] text-[var(--text-secondary)] group-hover:text-[var(--accent-text)] border border-[var(--border-color)] group-hover:border-transparent"
                                        }`}
                                    >
                                        <FontAwesomeIcon
                                            icon={isApplied ? faCheck : faArrowRight}
                                            className="text-[10px] mr-1.5"
                                        />
                                        <span>{isApplied ? "Applied!" : "Use"}</span>
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--bg-elevated)]/30 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5">
                        <span>Curated for Nexus AI • Lead Architect:</span>
                        <a
                            href="https://github.com/GattiHarishKumar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[var(--accent-primary)] hover:underline"
                        >
                            Harish Kumar Gatti
                        </a>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 rounded-md hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromptTemplatesModal;
