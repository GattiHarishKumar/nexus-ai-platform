import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { auth } from "../services/api";
import AuthLayout from "./auth/AuthLayout";

const RegistrationForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validatePassword = (pwd) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(pwd)) {
            setPasswordError(
                "Password must be 8+ chars with uppercase, lowercase, number, and special character."
            );
            return false;
        }
        setPasswordError("");
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name || !email || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!validatePassword(password)) {
            return;
        }

        setLoading(true);
        try {
            await auth.register({ name, email, password });
            toast.success("Account created! Please sign in.");
            navigate("/login");
        } catch (err) {
            if (err.response?.status === 409) {
                setError("User already exists. Please log in.");
            } else {
                const msg = err.response?.data || "Registration failed";
                setError(typeof msg === "string" ? msg : "Registration failed");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Or"
            linkText="sign in instead"
            linkTo="/login"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Name
                    </label>
                    <input
                        id="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="auth-input"
                        placeholder="Your name"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-input"
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            validatePassword(e.target.value);
                        }}
                        className="auth-input"
                        placeholder="Strong password"
                    />
                    {passwordError && (
                        <p className="text-red-400 text-xs mt-1">{passwordError}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                        Confirm Password
                    </label>
                    <input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="auth-input"
                        placeholder="Confirm password"
                    />
                </div>
                {error && (
                    <div className="text-red-400 text-sm" role="alert">{error}</div>
                )}
                <button type="submit" disabled={loading} className="auth-button">
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>
        </AuthLayout>
    );
};

export default RegistrationForm;
