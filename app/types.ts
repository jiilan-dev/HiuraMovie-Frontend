export interface User {
    id: string;
    username: string;
    email: string;
    role: 'ADMIN' | 'USER';
    created_at?: string;
}

export interface AuthResponse {
    access_token: string;
    access_token_expires_in: number;
    refresh_token_expires_in: number;
    user: User;
}

export interface ApiSuccess<T> {
    data: T;
    message: string;
    status: string;
}

// Movie Types
export interface Movie {
    id: string;
    title: string;
    slug: string;
    description?: string;
    release_year?: number;
    duration_seconds?: number;
    video_url?: string;
    poster_url?: string; // Placeholder for future
    created_at: string;
}

export interface Genre {
    id: string;
    name: string;
    slug: string;
}

export interface MovieDetail extends Movie {
    genres: Genre[];
}

// Series Types
export interface Series {
    id: string;
    title: string;
    slug: string;
    description?: string;
    thumbnail_url?: string;
    release_year?: number;
    rating?: number;
    created_at: string;
    updated_at: string;
}

export interface Season {
    id: string;
    series_id: string;
    season_number: number;
    title?: string;
    created_at: string;
    updated_at: string;
}

export interface Episode {
    id: string;
    season_id: string;
    episode_number: number;
    title?: string;
    description?: string;
    video_url?: string;
    thumbnail_url?: string;
    subtitle_url?: string;
    duration_seconds?: number;
    views?: number;
    status?: 'DRAFT' | 'PROCESSING' | 'READY' | 'FAILED';
    created_at: string;
    updated_at: string;
}

// Nested Responses
export interface SeriesListResponse {
    series: Series;
    genres: Genre[];
}

export interface SeasonResponse {
    season: Season;
    episodes: Episode[];
}

export interface SeriesDetailResponse {
    series: Series;
    genres: Genre[];
    seasons: SeasonResponse[];
}

// Request DTOs
export interface CreateSeriesRequest {
    title: string;
    description?: string;
    release_year?: number;
    genre_ids: string[];
}

export interface UpdateSeriesRequest {
    title?: string;
    description?: string;
    release_year?: number;
    genre_ids?: string[];
}

export interface CreateSeasonRequest {
    series_id: string;
    season_number: number;
    title?: string;
}

export interface UpdateSeasonRequest {
    title?: string;
    season_number?: number;
}

export interface CreateEpisodeRequest {
    season_id: string;
    episode_number: number;
    title?: string;
    description?: string;
    duration_seconds?: number;
}

export interface UpdateEpisodeRequest {
    title?: string;
    description?: string;
    episode_number?: number;
    duration_seconds?: number;
}
