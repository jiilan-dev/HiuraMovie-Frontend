import axios from 'axios';
import type { ApiSuccess, AuthResponse } from '~/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const REFRESH_INTERVAL_MS = 800 * 1000; // 800 seconds (before 900s expiry)

class TokenManager {
    private refreshTimer: ReturnType<typeof setInterval> | null = null;
    private isRefreshing = false;
    private refreshPromise: Promise<string | null> | null = null;

    // Start proactive refresh timer
    startAutoRefresh() {
        this.stopAutoRefresh(); // Clear any existing timer

        // Only start if we have a token
        if (!this.getToken()) return;

        this.refreshTimer = setInterval(async () => {
            console.log('[TokenManager] Proactive refresh triggered');
            await this.refreshToken();
        }, REFRESH_INTERVAL_MS);

        console.log('[TokenManager] Auto-refresh started (every 800s)');
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
            console.log('[TokenManager] Auto-refresh stopped');
        }
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    setToken(token: string) {
        localStorage.setItem('token', token);
        // Restart timer when new token is set
        this.startAutoRefresh();
    }

    clearToken() {
        localStorage.removeItem('token');
        this.stopAutoRefresh();
    }

    // Refresh token using cookies (refresh_token is sent via HttpOnly cookie)
    async refreshToken(): Promise<string | null> {
        // Prevent concurrent refresh calls
        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;
        this.refreshPromise = this._doRefresh();

        try {
            return await this.refreshPromise;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    private async _doRefresh(): Promise<string | null> {
        try {
            // Use axios directly (not http service) to avoid interceptor loops
            const response = await axios.post<ApiSuccess<AuthResponse>>(
                `${BASE_URL}/auth/refresh`,
                {},
                {
                    withCredentials: true, // Send cookies (refresh_token)
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const newToken = response.data.data.access_token;
            if (newToken) {
                this.setToken(newToken);
                console.log('[TokenManager] Token refreshed successfully');
                return newToken;
            }
            return null;
        } catch (error) {
            console.error('[TokenManager] Refresh failed:', error);
            this.clearToken();
            // Optionally redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
            return null;
        }
    }
}

export const tokenManager = new TokenManager();
