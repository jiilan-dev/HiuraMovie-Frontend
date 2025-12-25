import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from './token-manager';

// Get Base URL from env or default to localhost
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

class HttpService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request Interceptor: Attach Token
        this.client.interceptors.request.use(
            (config) => {
                const token = tokenManager.getToken();
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response Interceptor: Handle 401 with retry
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

                // If 401 and not already retried
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    console.log('[HttpService] 401 detected, attempting token refresh...');

                    const newToken = await tokenManager.refreshToken();

                    if (newToken) {
                        // Update the original request with new token
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        // Retry the request
                        return this.client(originalRequest);
                    }

                    // Refresh failed, token already cleared by tokenManager
                    return Promise.reject(error);
                }

                return Promise.reject(error);
            }
        );
    }

    // Generic GET
    public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.get(url, config);
        return response.data;
    }

    // Generic POST
    public async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.post(url, data, config);
        return response.data;
    }

    // Generic PUT
    public async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.put(url, data, config);
        return response.data;
    }

    // Generic DELETE
    public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        const response: AxiosResponse<T> = await this.client.delete(url, config);
        return response.data;
    }

    // Expose raw client for edge cases
    public get raw(): AxiosInstance {
        return this.client;
    }
}

export const http = new HttpService();
