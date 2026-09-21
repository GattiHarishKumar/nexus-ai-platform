import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowUp,
    faPaperclip,
    faMicrophone,
    faMicrophoneSlash,
    faXmark,
    faFileCode,
    faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

const ChatInput = ({
    value,
    onChange,
    onSend,
    disabled,
    maxLength = 4000,
    onOpenTemplates,
}) => {
    const fileInputRef = useRef(null);
    const textareaRef = useRef(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef(null);

    // Initialize Web Speech API if supported
    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onresult = (event) => {
                let transcript = "";
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                onChange((prev) => (prev ? `${prev} ${transcript}` : transcript));
            };

            recognition.onerror = (event) => {
                setIsRecording(false);
                if (event.error !== "no-speech") {
                    toast.error(`Voice input error: ${event.error}`);
                }
            };

            recognition.onend = () => {
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {
                    // Ignore on cleanup
                }
            }
        };
    }, [onChange]);

    const toggleVoice = () => {
        if (!recognitionRef.current) {
            toast.error("Speech Recognition is not supported by your browser");
            return;
        }

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            try {
                recognitionRef.current.start();
                setIsRecording(true);
                toast.success("Listening... Speak your prompt", { icon: "🎙️", duration: 2000 });
            } catch {
                setIsRecording(false);
                toast.error("Could not access microphone");
            }
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File exceeds 2MB limit");
            return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const content = loadEvent.target?.result;
            const ext = file.name.split(".").pop()?.toLowerCase() || "txt";
            setAttachedFile({
                name: file.name,
                size: (file.size / 1024).toFixed(1) + " KB",
                ext,
                content,
            });
            toast.success(`Attached ${file.name}`);
        };
        reader.onerror = () => {
            toast.error("Failed to read file contents");
        };
        reader.readAsText(file);

        // Reset file input so user can attach the same file again if needed
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeAttachedFile = () => {
        setAttachedFile(null);
    };

    const handleSend = () => {
        if (disabled) return;

        let fullPrompt = value.trim();

        if (attachedFile) {
            const fileHeader = `[Attached File: ${attachedFile.name}]\n\`\`\`${attachedFile.ext}\n${attachedFile.content}\n\`\`\`\n\n`;
            fullPrompt = fullPrompt ? `${fileHeader}${fullPrompt}` : `${fileHeader}Please review and analyze this code.`;
            setAttachedFile(null);
        }

        if (!fullPrompt.trim()) return;

        if (isRecording && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }

        onSend(fullPrompt);

        // Reset height
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const canSend = !disabled && (value.trim().length > 0 || attachedFile !== null);

    return (
        <div className="p-3 sm:p-4 bg-[var(--bg-secondary)]/90 border-t border-[var(--border-color)] backdrop-blur-md">
            <div className="max-w-4xl mx-auto space-y-2">
                {/* Attached File Preview Chip */}
                {attachedFile && (
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--accent-border)] text-xs animate-slide-up">
                        <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faFileCode} className="text-[var(--accent-primary)]" />
                            <span className="font-medium text-[var(--text-primary)]">
                                {attachedFile.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                ({attachedFile.size})
                            </span>
                        </div>
                        <button
                            onClick={removeAttachedFile}
                            className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-1 cursor-pointer"
                            title="Remove attachment"
                        >
                            <FontAwesomeIcon icon={faXmark} className="text-xs" />
                        </button>
                    </div>
                )}

                {/* Main Input Box */}
                <div className="relative flex items-end rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-color)] focus-within:border-[var(--border-focus)] focus-within:ring-2 focus-within:ring-[var(--accent-subtle)] transition-all shadow-sm">
                    {/* Hidden File Input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        accept=".txt,.java,.py,.js,.jsx,.ts,.tsx,.sql,.json,.md,.html,.css,.yml,.yaml,.properties,.sh"
                        className="hidden"
                    />

                    {/* Left Attachment & Template Actions */}
                    <div className="flex items-center gap-1 pl-2.5 pb-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={disabled}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all cursor-pointer disabled:opacity-40"
                            title="Attach code file (.java, .py, .sql, .json, .txt, etc.)"
                            aria-label="Attach code file"
                        >
                            <FontAwesomeIcon icon={faPaperclip} className="text-xs" />
                        </button>

                        <button
                            type="button"
                            onClick={onOpenTemplates}
                            disabled={disabled}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-elevated)] transition-all cursor-pointer disabled:opacity-40"
                            title="Open Engineering Prompt Library"
                            aria-label="Engineering Prompt Library"
                        >
                            <FontAwesomeIcon icon={faLayerGroup} className="text-xs" />
                        </button>
                    </div>

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={
                            isRecording
                                ? "Listening... speak clearly"
                                : "Ask Nexus AI anything... (Enter to send, Shift+Enter for newline)"
                        }
                        disabled={disabled}
                        rows={1}
                        maxLength={maxLength}
                        className="w-full resize-none bg-transparent text-[var(--text-primary)] px-3 py-3 text-sm focus:outline-none placeholder:text-[var(--text-muted)] disabled:opacity-50 min-h-[46px] max-h-[140px]"
                        onInput={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                        }}
                    />

                    {/* Right Voice & Send Controls */}
                    <div className="flex items-center gap-1.5 pr-2.5 pb-2 flex-shrink-0">
                        {/* Voice Input Button */}
                        <button
                            type="button"
                            onClick={toggleVoice}
                            disabled={disabled}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-all cursor-pointer ${
                                isRecording
                                    ? "bg-red-500 text-white recording-pulse"
                                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                            }`}
                            title={isRecording ? "Stop listening" : "Voice input (Speech to text)"}
                            aria-label="Voice input"
                        >
                            <FontAwesomeIcon
                                icon={isRecording ? faMicrophoneSlash : faMicrophone}
                                className="text-xs"
                            />
                        </button>

                        <span className="text-[10px] text-[var(--text-muted)] hidden md:inline px-1">
                            {value.length > 0 && `${value.length}/${maxLength}`}
                        </span>

                        {/* Send Prompt Button */}
                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={!canSend}
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs transition-all duration-200 cursor-pointer ${
                                canSend
                                    ? "bg-[var(--accent-gradient)] text-[var(--accent-text)] shadow-xs hover:scale-105 active:scale-95"
                                    : "bg-[var(--bg-elevated)] text-[var(--text-muted)] opacity-40 cursor-not-allowed"
                            }`}
                            aria-label="Send prompt"
                            title="Send prompt (Enter)"
                        >
                            <FontAwesomeIcon icon={faArrowUp} className="text-xs" />
                        </button>
                    </div>
                </div>

                {/* Input Footer Note */}
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] px-2">
                    <span className="truncate">
                        Nexus AI v2.4 • Architected by{" "}
                        <a
                            href="https://github.com/GattiHarishKumar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent-primary)] hover:underline font-medium"
                        >
                            Harish Kumar Gatti
                        </a>
                    </span>
                    <span className="hidden sm:inline">
                        Enter ↵ to send • Shift + Enter for newline
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ChatInput;
