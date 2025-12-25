import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

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
                const token = localStorage.getItem('token');
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response Interceptor: Handle Errors (Global)
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Token expired or invalid
                    localStorage.removeItem('token');
                    // Optional: Redirect to login or dispatch event
                    // window.location.href = '/login'; // Let the route loaders handle redirection via checks
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

    // Expose raw client for edge cases (e.g. multipart with specific handling)
    public get raw(): AxiosInstance {
        return this.client;
    }
}

export const http = new HttpService();
