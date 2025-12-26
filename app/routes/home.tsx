import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Hero } from '~/components/Hero';
import { MovieRow } from '~/components/MovieRow';
import { SeriesRow } from '~/components/SeriesRow';
import { movieService, type MovieResponse } from '~/services/movie';
import { seriesService } from '~/services/series';
import type { SeriesListResponse } from '~/types';

const resolveSeriesPoster = (thumb?: string, seriesId?: string) => {
  if (!thumb || !seriesId) return undefined;
  if (thumb.startsWith('http') || thumb.startsWith('/')) return thumb;
  return seriesService.getThumbnailUrl(seriesId);
};

const dummyMovies = [
  {
    id: 'dummy-m-1',
    title: 'Neon Drift',
    description: 'A getaway driver steals a prototype that bends time.',
    year: 2024,
    duration: '2h 04m',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80&auto=format&fit=crop',
  },
  {
    id: 'dummy-m-2',
    title: 'Crimson Harbor',
    description: 'A journalist uncovers a secret cult on a stormy island.',
    year: 2023,
    duration: '1h 51m',
    posterUrl: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=1920&q=80&auto=format&fit=crop',
  },
  {
    id: 'dummy-m-3',
    title: 'Pulse Runner',
    description: 'A hacker races to save a city from a blackout.',
    year: 2022,
    duration: '2h 12m',
    posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1920&q=80&auto=format&fit=crop',
  },
  {
    id: 'dummy-m-4',
    title: 'Silent Atlas',
    description: 'A cartographer maps a continent no one can remember.',
    year: 2021,
    duration: '2h 20m',
    posterUrl: 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=800&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=1920&q=80&auto=format&fit=crop',
  },
  {
    id: 'dummy-m-5',
    title: 'Glass Orbit',
    description: 'A crew fights to survive after a space elevator collapse.',
    year: 2020,
    duration: '1h 59m',
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80&auto=format&fit=crop',
  },
  {
    id: 'dummy-m-6',
    title: 'Night Circuit',
    description: 'A racer discovers a hidden league under the city.',
    year: 2024,
    duration: '1h 47m',
    posterUrl: 'https://images.unsplash.com/photo-1497015289639-54688650d173?w=800&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1497015289639-54688650d173?w=1920&q=80&auto=format&fit=crop',
  },
];

const dummySeries = [
  {
    id: 'dummy-s-1',
    title: 'Signal City',
    description: 'Detectives trace a rogue signal across parallel timelines.',
    year: 2023,
    posterUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&q=80&auto=format&fit=crop',
  },
  {
    id: 'dummy-s-2',
    title: 'Velvet District',
    description: 'A lounge singer becomes the face of a rebellion.',
    year: 2022,
    posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80&auto=format&fit=crop',
  },
  {
    id: 'dummy-s-3',
    title: 'Iron Coast',
    description: 'Families fight for control of a futuristic shipping empire.',
    year: 2024,
    posterUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80&auto=format&fit=crop',
  },
  {
    id: 'dummy-s-4',
    title: 'Echo Gardens',
    description: 'A botanist uncovers a voice hidden in rare flowers.',
    year: 2021,
    posterUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&q=80&auto=format&fit=crop',
  },
  {
    id: 'dummy-s-5',
    title: 'Paper Tigers',
    description: 'Students in a quiet town hide a world-class heist crew.',
    year: 2020,
    posterUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&q=80&auto=format&fit=crop',
    heroImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1920&q=80&auto=format&fit=crop',
  },
];

type HeroCandidate = {
  id: string;
  title: string;
  description?: string;
  backgroundImage?: string;
  kind: 'movie' | 'series';
  isDummy: boolean;
};

const shuffleItems = <T,>(items: T[]) => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export default function Home() {
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seriesError, setSeriesError] = useState<string | null>(null);
  const [dummyNotice, setDummyNotice] = useState<string | null>(null);
  const dummyNoticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showDummyNotice = useCallback((kind: 'film' | 'series') => {
    const message =
      kind === 'film'
        ? 'Ini cuma film dummy, belum bisa diputar.'
        : 'Ini cuma series dummy, belum bisa dibuka.';
    setDummyNotice(message);
    if (dummyNoticeTimer.current) {
      clearTimeout(dummyNoticeTimer.current);
    }
    dummyNoticeTimer.current = setTimeout(() => {
      setDummyNotice(null);
    }, 2800);
  }, []);

  useEffect(() => {
    return () => {
      if (dummyNoticeTimer.current) {
        clearTimeout(dummyNoticeTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadMovies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await movieService.list();
        if (!active) return;
        setMovies(data);
      } catch (err) {
        if (!active) return;
        setError('Failed to load movies.');
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadMovies();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadSeries = async () => {
      setSeriesLoading(true);
      setSeriesError(null);

      try {
        const data = await seriesService.list();
        if (!active) return;
        setSeriesList(data);
      } catch (err) {
        if (!active) return;
        setSeriesError('Failed to load series.');
      } finally {
        if (active) {
          setSeriesLoading(false);
        }
      }
    };

    loadSeries();

    return () => {
      active = false;
    };
  }, []);

  const readyMovies = useMemo(
    () => movies.filter((item) => item.movie.status === 'READY' || !item.movie.status),
    [movies]
  );

  const realMovieRows = useMemo(
    () =>
      readyMovies.map(({ movie }) => ({
        id: movie.id,
        title: movie.title,
        posterUrl: movie.thumbnail_url ? movieService.getThumbnailUrl(movie.id) : undefined,
        year: movie.release_year ?? undefined,
        duration: movie.duration_seconds
          ? movieService.formatDuration(movie.duration_seconds)
          : undefined,
      })),
    [readyMovies]
  );

  const dummyMovieRows = useMemo(
    () =>
      dummyMovies.map((movie) => ({
        id: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        year: movie.year,
        duration: movie.duration,
        isDummy: true,
        onDummyClick: () => showDummyNotice('film'),
      })),
    [showDummyNotice]
  );

  const mixedMovies = useMemo(
    () => shuffleItems([...realMovieRows, ...dummyMovieRows]),
    [realMovieRows, dummyMovieRows]
  );

  const realSeriesRows = useMemo(
    () =>
      seriesList.map(({ series }) => ({
        id: series.id,
        title: series.title,
        posterUrl: resolveSeriesPoster(series.thumbnail_url, series.id),
        year: series.release_year ?? undefined,
      })),
    [seriesList]
  );

  const dummySeriesRows = useMemo(
    () =>
      dummySeries.map((series) => ({
        id: series.id,
        title: series.title,
        posterUrl: series.posterUrl,
        year: series.year,
        isDummy: true,
        onDummyClick: () => showDummyNotice('series'),
      })),
    [showDummyNotice]
  );

  const mixedSeries = useMemo(
    () => shuffleItems([...realSeriesRows, ...dummySeriesRows]),
    [realSeriesRows, dummySeriesRows]
  );

  const movieRowGroups = useMemo(() => {
    if (mixedMovies.length === 0) return [];
    const curated = shuffleItems(mixedMovies);
    return [
      { title: 'Trending Now', items: curated.slice(0, 10) },
      { title: 'Only on Hiura', items: curated.slice(4, 14) },
      { title: 'Late Night Thrillers', items: shuffleItems(mixedMovies).slice(0, 10) },
    ];
  }, [mixedMovies]);

  const seriesRowGroups = useMemo(() => {
    if (mixedSeries.length === 0) return [];
    const curated = shuffleItems(mixedSeries);
    return [
      { title: 'Binge Worthy Series', items: curated.slice(0, 10) },
      { title: 'Fresh Seasons', items: curated.slice(3, 13) },
    ];
  }, [mixedSeries]);

  const heroItem = useMemo<HeroCandidate | undefined>(() => {
    const moviePool: HeroCandidate[] = readyMovies.map(({ movie }) => ({
      id: movie.id,
      title: movie.title,
      description: movie.description ?? undefined,
      backgroundImage: movie.thumbnail_url
        ? movieService.getThumbnailUrl(movie.id)
        : 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&q=80',
      kind: 'movie',
      isDummy: false,
    }));

    const seriesPool: HeroCandidate[] = seriesList.map(({ series }) => ({
      id: series.id,
      title: series.title,
      description: series.description ?? undefined,
      backgroundImage:
        resolveSeriesPoster(series.thumbnail_url, series.id) ??
        'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&q=80',
      kind: 'series',
      isDummy: false,
    }));

    const dummyMoviePool: HeroCandidate[] = dummyMovies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      description: movie.description,
      backgroundImage: movie.heroImage,
      kind: 'movie',
      isDummy: true,
    }));

    const dummySeriesPool: HeroCandidate[] = dummySeries.map((series) => ({
      id: series.id,
      title: series.title,
      description: series.description,
      backgroundImage: series.heroImage,
      kind: 'series',
      isDummy: true,
    }));

    const pool = [
      ...moviePool,
      ...seriesPool,
      ...dummyMoviePool,
      ...dummySeriesPool,
    ];

    if (pool.length === 0) return undefined;
    const pick = Math.floor(Math.random() * pool.length);
    return pool[pick];
  }, [readyMovies, seriesList]);

  const handleHeroDummy = useCallback(() => {
    if (!heroItem?.isDummy) return;
    showDummyNotice(heroItem.kind === 'series' ? 'series' : 'film');
  }, [heroItem, showDummyNotice]);

  return (
    <>
      {/* Hero Section */}
      <Hero
        title={heroItem?.title ?? 'Stranger Things'}
        description={
          heroItem?.description ??
          'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.'
        }
        backgroundImage={
          heroItem?.backgroundImage ??
          'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&q=80'
        }
        movieId={heroItem?.kind === 'movie' ? heroItem.id : undefined}
        primaryHref={heroItem?.kind === 'series' ? `/series/${heroItem.id}` : undefined}
        secondaryHref={heroItem?.kind === 'series' ? `/series/${heroItem.id}` : undefined}
        onPrimaryAction={heroItem?.isDummy ? handleHeroDummy : undefined}
        onSecondaryAction={heroItem?.isDummy ? handleHeroDummy : undefined}
      />

      {dummyNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-black/90 text-white px-4 py-3 rounded-lg border border-white/10 shadow-lg">
          {dummyNotice}
        </div>
      )}

      {/* Movie Rows */}
      <div className="mt-8 relative z-10 space-y-8 pb-12">
        {isLoading && (
          <div className="flex items-center gap-3 text-gray-400 px-4 md:px-12">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading movies...</span>
          </div>
        )}

        {!isLoading && error && (
          <div className="text-red-400 px-4 md:px-12">{error}</div>
        )}

        {movieRowGroups.map((row) =>
          row.items.length > 0 ? (
            <MovieRow key={row.title} title={row.title} movies={row.items} />
          ) : null
        )}

        {!isLoading && !error && mixedMovies.length === 0 && (
          <div className="text-gray-400 px-4 md:px-12">No movies available yet.</div>
        )}

        {seriesLoading && (
          <div className="flex items-center gap-3 text-gray-400 px-4 md:px-12">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading series...</span>
          </div>
        )}

        {!seriesLoading && seriesError && (
          <div className="text-red-400 px-4 md:px-12">{seriesError}</div>
        )}

        {seriesRowGroups.map((row) =>
          row.items.length > 0 ? (
            <SeriesRow key={row.title} title={row.title} series={row.items} />
          ) : null
        )}

        {!seriesLoading && !seriesError && mixedSeries.length === 0 && (
          <div className="text-gray-400 px-4 md:px-12">No series available yet.</div>
        )}
      </div>
    </>
  );
}
