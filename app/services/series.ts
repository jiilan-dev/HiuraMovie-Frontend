import { http } from './http';
import type {
    ApiSuccess,
    Series,
    SeriesListResponse,
    SeriesDetailResponse,
    Season,
    SeasonResponse,
    Episode,
    CreateSeriesRequest,
    UpdateSeriesRequest,
    CreateSeasonRequest,
    UpdateSeasonRequest,
    CreateEpisodeRequest,
    UpdateEpisodeRequest
} from '~/types';

export const seriesService = {
    // --- SERIES ---

    async list(): Promise<SeriesListResponse[]> {
        const response = await http.get<ApiSuccess<SeriesListResponse[]>>('/series');
        return response.data;
    },

    async get(id: string): Promise<SeriesDetailResponse> {
        const response = await http.get<ApiSuccess<SeriesDetailResponse>>(`/series/${id}`);
        return response.data;
    },

    async create(data: CreateSeriesRequest): Promise<SeriesDetailResponse> {
        const response = await http.post<ApiSuccess<SeriesDetailResponse>>('/series', data);
        return response.data;
    },

    async update(id: string, data: UpdateSeriesRequest): Promise<SeriesDetailResponse> {
        const response = await http.put<ApiSuccess<SeriesDetailResponse>>(`/series/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await http.delete(`/series/${id}`);
    },

    // --- SEASONS ---

    async createSeason(data: CreateSeasonRequest): Promise<SeasonResponse> {
        const response = await http.post<ApiSuccess<SeasonResponse>>('/seasons', data);
        return response.data;
    },

    async updateSeason(id: string, data: UpdateSeasonRequest): Promise<SeasonResponse> {
        const response = await http.put<ApiSuccess<SeasonResponse>>(`/seasons/${id}`, data);
        return response.data;
    },

    async deleteSeason(id: string): Promise<void> {
        await http.delete(`/seasons/${id}`);
    },

    // --- EPISODES ---

    async createEpisode(data: CreateEpisodeRequest): Promise<Episode> {
        const response = await http.post<ApiSuccess<Episode>>('/episodes', data);
        return response.data;
    },

    async updateEpisode(id: string, data: UpdateEpisodeRequest): Promise<Episode> {
        const response = await http.put<ApiSuccess<Episode>>(`/episodes/${id}`, data);
        return response.data;
    },

    async deleteEpisode(id: string): Promise<void> {
        await http.delete(`/episodes/${id}`);
    },

    // --- UPLOADS ---

    async uploadEpisodeVideo(
        episodeId: string,
        file: File,
        onProgress?: (percent: number) => void
    ): Promise<string> {
        const formData = new FormData();
        formData.append('video', file);

        const response = await http.post<ApiSuccess<string>>(
            `/episodes/${episodeId}/upload`,
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

    async uploadEpisodeThumbnail(
        episodeId: string,
        file: File,
        onProgress?: (percent: number) => void
    ): Promise<string> {
        const formData = new FormData();
        formData.append('thumbnail', file);

        const response = await http.post<ApiSuccess<string>>(
            `/episodes/${episodeId}/upload-thumbnail`,
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

    async uploadSeriesThumbnail(
        seriesId: string,
        file: File,
        onProgress?: (percent: number) => void
    ): Promise<string> {
        const formData = new FormData();
        formData.append('thumbnail', file);

        const response = await http.post<ApiSuccess<string>>(
            `/series/${seriesId}/upload-thumbnail`,
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

    async getEpisodeTranscodeProgress(episodeId: string): Promise<number> {
        const response = await http.get<ApiSuccess<number>>(`/episodes/${episodeId}/progress`);
        return response.data ?? 0;
    },

    getThumbnailUrl(seriesId: string): string {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        return `${baseUrl}/series/${seriesId}/thumbnail`;
    },

    getEpisodeStreamUrl(episodeId: string): string {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        return `${baseUrl}/episodes/${episodeId}/stream`;
    },

    getEpisodeSubtitleUrl(episodeId: string): string {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
        return `${baseUrl}/episodes/${episodeId}/subtitle`;
    },
};
