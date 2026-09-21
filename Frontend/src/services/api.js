import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("user");
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export const auth = {
    register: (data) => api.post("/register", data),
    login: (data) => api.post("/login", data),
};

export const chat = {
    ask: (data) => api.post("/api/qna/ask", data),
    createSession: () => api.post("/api/qna/session"),
    listSessions: () => api.get("/api/qna/sessions"),
    getHistory: (sessionId) => api.get(`/api/qna/history/${sessionId}`),
    deleteSession: (sessionId) => api.delete(`/api/qna/session/${sessionId}`),
};

export const skills = {
    list: () => api.get("/api/skills"),
};

export const system = {
    getStatus: () => api.get("/api/system/status"),
};

export default api;
