import { http } from './http';
import type { ApiSuccess, Movie, MovieDetail } from '~/types';

export const videoService = {
    async getMovies() {
        // GET /movies returns ApiSuccess<MovieResponse[]> -> converted to list in backend? 
        // Wait, backend list_movies returns Vec<MovieResponse>. So just array? with ApiResponse wrapper?
        // checking handler: ApiSuccess(ApiResponse::success(res, "Movies retrieved"), StatusCode::OK)

        const response = await http.get<ApiSuccess<MovieDetail[]>>('/movies');
        return response.data;
    },

    async getMovie(id: string) {
        const response = await http.get<ApiSuccess<MovieDetail>>(`/movies/${id}`);
        return response.data;
    },

    getStreamUrl(id: string) {
        // Direct URL to the backend stream endpoint
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
        return `${baseUrl}/movies/${id}/stream`;
    }
};
