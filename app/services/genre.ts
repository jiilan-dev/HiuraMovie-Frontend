import { http } from './http';
import type { ApiSuccess } from '~/types';

export interface Genre {
    id: string;
    name: string;
    slug: string;
}

export interface CreateGenreRequest {
    name: string;
    slug: string;
}

export interface UpdateGenreRequest {
    name?: string;
    slug?: string;
}

export const genreService = {
    async list(): Promise<Genre[]> {
        const response = await http.get<ApiSuccess<Genre[]>>('/genres');
        return response.data;
    },

    async get(id: string): Promise<Genre> {
        const response = await http.get<ApiSuccess<Genre>>(`/genres/${id}`);
        return response.data;
    },

    async create(data: CreateGenreRequest): Promise<Genre> {
        const response = await http.post<ApiSuccess<Genre>>('/genres', data);
        return response.data;
    },

    async update(id: string, data: UpdateGenreRequest): Promise<Genre> {
        const response = await http.put<ApiSuccess<Genre>>(`/genres/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await http.delete(`/genres/${id}`);
    },
};
