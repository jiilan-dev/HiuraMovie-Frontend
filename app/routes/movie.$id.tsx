import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, Loader2, Play } from 'lucide-react';
import { movieService, type MovieResponse } from '~/services/movie';

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState<MovieResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadMovie = async () => {
      if (!id) {
        setError('Movie ID not found.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const data = await movieService.get(id);
        if (!active) return;
        setMovie(data);
      } catch {
        if (!active) return;
        setError('Movie not found.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadMovie();

    return () => {
      active = false;
    };
  }, [id]);

  const backdropUrl = useMemo(() => {
    if (!movie?.movie.thumbnail_url) return undefined;
    return movieService.getThumbnailUrl(movie.movie.id);
  }, [movie]);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="relative min-h-[70vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: backdropUrl
              ? `url(${backdropUrl})`
              : 'linear-gradient(135deg, #111827, #0b0b0b)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0b0b] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-24 pb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="mt-10 max-w-2xl">
            {isLoading ? (
              <div className="flex items-center gap-3 text-gray-300">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading movie...</span>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-100">
                {error}
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {movie?.movie.title}
                </h1>
                <p className="text-lg text-gray-200 leading-relaxed mb-6">
                  {movie?.movie.description || 'No description available yet.'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-8">
                  <span>{movie?.movie.release_year || '-'}</span>
                  <span className="text-gray-500">•</span>
                  <span>{movieService.formatDuration(movie?.movie.duration_seconds)}</span>
                  <span className="text-gray-500">•</span>
                  <span className="uppercase tracking-wide text-xs text-gray-400">
                    {movie?.movie.status || 'DRAFT'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/watch/${movie?.movie.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white text-black px-6 py-3 font-semibold hover:bg-gray-200 transition-colors"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Watch Now
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {!isLoading && !error && movie && (
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-6 md:grid-cols-[2fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm uppercase tracking-widest text-white/60 mb-4">About</h2>
            <p className="text-gray-300 leading-relaxed">
              {movie.movie.description || 'No description available yet.'}
            </p>
            {movie.genres.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/80"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm uppercase tracking-widest text-white/60 mb-4">Details</h2>
            <div className="space-y-3 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Release</span>
                <span>{movie.movie.release_year || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Duration</span>
                <span>{movieService.formatDuration(movie.movie.duration_seconds)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Status</span>
                <span className="uppercase text-xs tracking-wide text-white/70">
                  {movie.movie.status || 'DRAFT'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Views</span>
                <span>{movie.movie.views?.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
