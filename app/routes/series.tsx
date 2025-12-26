import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { SeriesCard } from '~/components/SeriesCard';
import { seriesService } from '~/services/series';
import type { SeriesListResponse } from '~/types';

const resolveSeriesPoster = (thumb?: string, seriesId?: string) => {
  if (!thumb || !seriesId) return undefined;
  if (thumb.startsWith('http') || thumb.startsWith('/')) return thumb;
  return seriesService.getThumbnailUrl(seriesId);
};

export default function SeriesList() {
  const [seriesList, setSeriesList] = useState<SeriesListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadSeries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await seriesService.list();
        if (!active) return;
        setSeriesList(data);
      } catch (err) {
        if (!active) return;
        setError('Failed to load series.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadSeries();
    return () => {
      active = false;
    };
  }, []);

  const seriesCards = useMemo(
    () =>
      seriesList.map(({ series }) => ({
        id: series.id,
        title: series.title,
        posterUrl: resolveSeriesPoster(series.thumbnail_url, series.id),
        year: series.release_year ?? undefined,
      })),
    [seriesList]
  );

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-10">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Series</h1>
          <p className="text-gray-400 mt-2">Browse TV series available on Hiura.</p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading series...</span>
          </div>
        )}

        {!isLoading && error && <div className="text-red-400">{error}</div>}

        {!isLoading && !error && seriesCards.length === 0 && (
          <div className="text-gray-400">No series available yet.</div>
        )}

        {!isLoading && !error && seriesCards.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {seriesCards.map((series) => (
              <SeriesCard
                key={series.id}
                id={series.id}
                title={series.title}
                posterUrl={series.posterUrl}
                year={series.year}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
