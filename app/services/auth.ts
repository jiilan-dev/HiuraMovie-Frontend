import { http } from './http';
import type { ApiSuccess, AuthResponse, User } from '~/types';

export const authService = {
    async login(payload: { email: string; password: string }) {
        // Backend returns ApiSuccess<AuthResponse>
        const response = await http.post<ApiSuccess<AuthResponse>>('/auth/login', payload);
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }
        return response.data;
    },

    async register(payload: { username: string; email: string; password: string }) {
        const response = await http.post<ApiSuccess<AuthResponse>>('/auth/register', payload);
        return response.data;
    },

    async getProfile() {
        const response = await http.get<ApiSuccess<User>>('/auth/me');
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }
};
