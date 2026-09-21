import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrochip } from "@fortawesome/free-solid-svg-icons";

const AuthLayout = ({ title, subtitle, linkText, linkTo, children }) => {
    return (
        <div className="min-h-screen flex items-center justify-center auth-bg px-4 py-12">
            <div className="w-full max-w-md animate-fade-in">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--accent-gradient)] text-[var(--accent-text)] mb-3 shadow-md shadow-[var(--accent-glow)] transition-transform duration-300 hover:scale-105">
                        <FontAwesomeIcon icon={faMicrochip} className="text-lg" />
                    </div>
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                        <span className="text-xs font-semibold tracking-widest text-[var(--accent-primary)] uppercase">
                            Nexus AI Platform
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{title}</h1>
                    <p className="mt-1.5 text-xs text-[var(--text-secondary)]">
                        {subtitle}{" "}
                        <Link to={linkTo} className="text-[var(--accent-primary)] hover:underline font-semibold">
                            {linkText}
                        </Link>
                    </p>
                </div>

                <div className="glass-panel rounded-2xl p-7 shadow-xl shadow-black/20">
                    {children}
                </div>

                <div className="text-center mt-6 space-y-1">
                    <p className="text-[11px] text-[var(--text-muted)]">
                        Architected by{" "}
                        <a
                            href="https://github.com/GattiHarishKumar"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[var(--accent-primary)] hover:underline"
                        >
                            Harish Kumar Gatti
                        </a>
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">
                        <a
                            href="mailto:harishkumargatti@gmail.com"
                            className="hover:text-[var(--text-secondary)] transition-colors"
                        >
                            harishkumargatti@gmail.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
