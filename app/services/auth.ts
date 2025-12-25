import { http } from './http';
import { tokenManager } from './token-manager';
import type { ApiSuccess, AuthResponse, User } from '~/types';

export const authService = {
    async login(payload: { email: string; password: string }) {
        const response = await http.post<ApiSuccess<AuthResponse>>('/auth/login', payload);

        if (response.data.access_token) {
            tokenManager.setToken(response.data.access_token);
            // Auto-refresh is started by setToken
        }

        return response.data;
    },

    async register(payload: { username: string; email: string; password: string; full_name: string }) {
        const response = await http.post<ApiSuccess<AuthResponse>>('/auth/register', payload);

        if (response.data.access_token) {
            tokenManager.setToken(response.data.access_token);
        }

        return response.data;
    },

    async getProfile() {
        const response = await http.get<ApiSuccess<User>>('/auth/me');
        return response.data;
    },

    async logout() {
        try {
            await http.post('/auth/logout');
        } catch {
            // Ignore errors - still clear local token
        }
        tokenManager.clearToken();
    },

    isAuthenticated() {
        return !!tokenManager.getToken();
    },

    // Initialize auto-refresh if token exists (call on app mount)
    initializeAuth() {
        if (tokenManager.getToken()) {
            tokenManager.startAutoRefresh();
        }
    }
};
