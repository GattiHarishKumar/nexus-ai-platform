package com.ai.gemini_chat.Config;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class RateLimitService {

    private static final int MAX_REQUESTS = 20;
    private static final long WINDOW_SECONDS = 60;

    private final Map<Integer, Window> windows = new ConcurrentHashMap<>();

    public boolean allowRequest(Integer userId) {
        Window window = windows.computeIfAbsent(userId, id -> new Window());
        synchronized (window) {
            long now = Instant.now().getEpochSecond();
            if (now - window.windowStart >= WINDOW_SECONDS) {
                window.windowStart = now;
                window.count = 0;
            }
            if (window.count >= MAX_REQUESTS) {
                return false;
            }
            window.count++;
            return true;
        }
    }

    private static class Window {
        long windowStart = Instant.now().getEpochSecond();
        int count = 0;
    }
}
