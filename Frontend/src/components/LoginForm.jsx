import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { auth } from "../services/api";
import AuthLayout from "./auth/AuthLayout";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }

        setLoading(true);
        try {
            const response = await auth.login({ email, password });
            const { token, email: userEmail, name } = response.data;
            sessionStorage.setItem("token", token);
            sessionStorage.setItem("user", JSON.stringify({ email: userEmail, name }));
            toast.success("Welcome back!");
            navigate("/home");
        } catch (err) {
            const msg = err.response?.data || "Invalid username or password";
            setError(typeof msg === "string" ? msg : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Sign in to Nexus AI"
            subtitle="Or"
            linkText="create an account"
            linkTo="/"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
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
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input"
                        placeholder="Your password"
                    />
                </div>
                {error && (
                    <div className="text-red-400 text-sm" role="alert">{error}</div>
                )}
                <button type="submit" disabled={loading} className="auth-button">
                    {loading ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </AuthLayout>
    );
};

export default LoginForm;
