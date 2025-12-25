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
