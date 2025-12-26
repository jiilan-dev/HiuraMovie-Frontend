import { http } from './http';
import type { ApiSuccess, Genre } from '~/types';

// Movie model matching backend
export interface Movie {
    id: string;
    title: string;
    slug: string;
    description?: string;
    video_url?: string;
    thumbnail_url?: string;
    subtitle_url?: string;
    release_year?: number;
    duration_seconds?: number;
    rating?: number;
    views?: number;
    status?: 'DRAFT' | 'PROCESSING' | 'READY' | 'FAILED';
    created_at: string;
    updated_at: string;
}

// API response includes genres
export interface MovieResponse {
    movie: Movie;
    genres: Genre[];
}

export interface CreateMovieRequest {
    title: string;
    description?: string;
    release_year?: number;
    duration_seconds?: number;
    genre_ids: string[];
}

export interface UpdateMovieRequest {
    title?: string;
    description?: string;
    release_year?: number;
    genre_ids?: string[];
}

export const movieService = {
    /**
     * List all movies
     */
    async list(): Promise<MovieResponse[]> {
        const response = await http.get<ApiSuccess<MovieResponse[]>>('/movies');
        return response.data;
    },

    /**
     * Get a single movie by ID
     */
    async get(id: string): Promise<MovieResponse> {
        const response = await http.get<ApiSuccess<MovieResponse>>(`/movies/${id}`);
        return response.data;
    },

    /**
     * Create a new movie
     */
    async create(data: CreateMovieRequest): Promise<MovieResponse> {
        const response = await http.post<ApiSuccess<MovieResponse>>('/movies', data);
        return response.data;
    },

    /**
     * Update a movie
     */
    async update(id: string, data: UpdateMovieRequest): Promise<MovieResponse> {
        const response = await http.put<ApiSuccess<MovieResponse>>(`/movies/${id}`, data);
        return response.data;
    },

    /**
     * Delete a movie
     */
    async delete(id: string): Promise<void> {
        await http.delete(`/movies/${id}`);
    },

    /**
     * Upload video file to a movie
     * Uses FormData for multipart upload
     * @param onProgress - Callback for upload progress (0-100)
     */
    async uploadVideo(
        movieId: string,
        file: File,
        onProgress?: (percent: number) => void
    ): Promise<string> {
        const formData = new FormData();
        formData.append('video', file);

        const response = await http.post<ApiSuccess<string>>(
            `/movies/${movieId}/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percent);
                    }
                },
            }
        );
        return response.data;
    },

    /**
     * Upload thumbnail image to a movie
     */
    async uploadThumbnail(
        movieId: string,
        file: File,
        onProgress?: (percent: number) => void
    ): Promise<string> {
        const formData = new FormData();
        formData.append('thumbnail', file);

        const response = await http.post<ApiSuccess<string>>(
            `/movies/${movieId}/upload-thumbnail`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percent);
                    }
                },
            }
        );
        return response.data;
    },

    /**
     * Get streaming URL for a movie
     */
    getStreamUrl(movieId: string): string {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        return `${baseUrl}/movies/${movieId}/stream`;
    },

    /**
     * Get thumbnail URL for a movie
     */
    getThumbnailUrl(movieId: string): string {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        return `${baseUrl}/movies/${movieId}/thumbnail`;
    },

    /**
     * Get subtitle URL for a movie (VTT)
     */
    getSubtitleUrl(movieId: string): string {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        return `${baseUrl}/movies/${movieId}/subtitle`;
    },

    /**
     * Get transcode progress for a movie (0-100)
     */
    async getTranscodeProgress(movieId: string): Promise<number> {
        const response = await http.get<ApiSuccess<number>>(`/movies/${movieId}/progress`);
        return response.data ?? 0;
    },

    /**
     * Format duration in seconds to human readable
     */
    formatDuration(seconds?: number): string {
        if (!seconds) return '-';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    },

    /**
     * Get status badge color
     */
    getStatusColor(status?: string): string {
        switch (status) {
            case 'READY': return 'bg-green-500/20 text-green-400';
            case 'PROCESSING': return 'bg-yellow-500/20 text-yellow-400';
            case 'FAILED': return 'bg-red-500/20 text-red-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    },
};
