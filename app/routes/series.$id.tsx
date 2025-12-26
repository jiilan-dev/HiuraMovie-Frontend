import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft, ChevronDown, Loader2, Play } from 'lucide-react';
import { seriesService } from '~/services/series';
import type { SeriesDetailResponse, Episode, Season } from '~/types';

const resolveImageUrl = (value?: string, seriesId?: string) => {
  if (!value || !seriesId) return undefined;
  if (value.startsWith('http') || value.startsWith('/')) return value;
  return seriesService.getThumbnailUrl(seriesId);
};

const formatEpisodeLabel = (season: Season, episode: Episode) =>
  `S${season.season_number.toString().padStart(2, '0')} · E${episode.episode_number
    .toString()
    .padStart(2, '0')}`;

export default function SeriesDetail() {
  const { id } = useParams();
  const [seriesData, setSeriesData] = useState<SeriesDetailResponse | null>(null);
  const [expandedSeasons, setExpandedSeasons] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadSeries = async () => {
      if (!id) {
        setError('Series ID not found.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const data = await seriesService.get(id);
        if (!active) return;
        setSeriesData(data);
        if (data.seasons.length > 0) {
          setExpandedSeasons({ [data.seasons[0].season.id]: true });
        }
      } catch (err) {
        if (!active) return;
        setError('Series not found.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadSeries();
    return () => {
      active = false;
    };
  }, [id]);

  const sortedSeasons = useMemo(() => {
    if (!seriesData) return [];
    return [...seriesData.seasons].sort(
      (a, b) => a.season.season_number - b.season.season_number
    );
  }, [seriesData]);

  const backdropUrl = useMemo(
    () => resolveImageUrl(seriesData?.series.thumbnail_url, seriesData?.series.id),
    [seriesData]
  );

  const toggleSeason = (seasonId: string) => {
    setExpandedSeasons((prev) => ({
      ...prev,
      [seasonId]: !prev[seasonId],
    }));
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="relative min-h-[60vh] overflow-hidden">
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
            to="/series"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Series
          </Link>

          <div className="mt-10 max-w-2xl">
            {isLoading ? (
              <div className="flex items-center gap-3 text-gray-300">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading series...</span>
              </div>
            ) : error ? (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-100">
                {error}
              </div>
            ) : (
              <>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {seriesData?.series.title}
                </h1>
                <p className="text-lg text-gray-200 leading-relaxed mb-6">
                  {seriesData?.series.description || 'No description available yet.'}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-8">
                  <span>{seriesData?.series.release_year || '-'}</span>
                  <span className="text-gray-500">•</span>
                  <span>{seriesData?.series.rating ? `${seriesData.series.rating} ★` : 'No Rating'}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {!isLoading && !error && seriesData && (
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-sm uppercase tracking-widest text-white/60 mb-4">Seasons</h2>
            <div className="space-y-4">
              {sortedSeasons.length === 0 && (
                <div className="text-gray-400">No seasons available yet.</div>
              )}

              {sortedSeasons.map((seasonResp) => {
                const isOpen = expandedSeasons[seasonResp.season.id];
                const episodes = [...seasonResp.episodes].sort(
                  (a, b) => a.episode_number - b.episode_number
                );

                return (
                  <div
                    key={seasonResp.season.id}
                    className="rounded-xl border border-white/10 bg-black/40 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSeason(seasonResp.season.id)}
                      className="w-full flex items-center justify-between px-4 py-4 text-left hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <p className="text-white font-semibold">
                          {seasonResp.season.title || `Season ${seasonResp.season.season_number}`}
                        </p>
                        <p className="text-xs text-gray-500">{episodes.length} Episodes</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/10">
                        {episodes.length === 0 ? (
                          <div className="p-4 text-sm text-gray-400">No episodes yet.</div>
                        ) : (
                          <div className="divide-y divide-white/5">
                            {episodes.map((episode) => {
                              const canWatch = episode.status === 'READY' && episode.video_url;
                              return (
                                <div
                                  key={episode.id}
                                  className="flex flex-col md:flex-row md:items-center gap-4 px-4 py-4"
                                >
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-500 mb-1">
                                      {formatEpisodeLabel(seasonResp.season, episode)}
                                    </p>
                                    <h3 className="text-lg font-semibold text-white">
                                      {episode.title || `Episode ${episode.episode_number}`}
                                    </h3>
                                    <p className="text-sm text-gray-400 mt-2">
                                      {episode.description || 'No description available.'}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {episode.status && (
                                      <span className="text-xs uppercase tracking-wide text-gray-400">
                                        {episode.status}
                                      </span>
                                    )}
                                    <Link
                                      to={`/series/${seriesData.series.id}/episode/${episode.id}`}
                                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                        canWatch
                                          ? 'bg-white text-black hover:bg-gray-200'
                                          : 'bg-gray-700/50 text-gray-400 cursor-not-allowed pointer-events-none'
                                      }`}
                                    >
                                      <Play className="w-4 h-4 fill-current" />
                                      {canWatch ? 'Watch' : 'Unavailable'}
                                    </Link>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {seriesData.genres.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-sm uppercase tracking-widest text-white/60 mb-4">Genres</h2>
              <div className="flex flex-wrap gap-2">
                {seriesData.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/80"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
