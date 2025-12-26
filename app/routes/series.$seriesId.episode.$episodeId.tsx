import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useParams } from 'react-router';
import {
  ArrowLeft,
  Loader2,
  Maximize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { seriesService } from '~/services/series';
import type { Episode, Season, SeriesDetailResponse } from '~/types';

const SKIP_SECONDS = 5;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const formatTime = (value?: number) => {
  if (!value || !Number.isFinite(value)) return '0:00';
  const totalSeconds = Math.floor(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

type EpisodeEntry = {
  episode: Episode;
  season: Season;
};

export default function WatchEpisode() {
  const { seriesId, episodeId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);

  const [seriesData, setSeriesData] = useState<SeriesDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTime, setSeekTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadSeries = async () => {
      if (!seriesId || !episodeId) {
        setError('Episode not found.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const data = await seriesService.get(seriesId);
        if (!active) return;
        setSeriesData(data);
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
  }, [seriesId, episodeId]);

  const episodeEntries = useMemo(() => {
    if (!seriesData) return [];
    return [...seriesData.seasons]
      .sort((a, b) => a.season.season_number - b.season.season_number)
      .flatMap((seasonResp) =>
        [...seasonResp.episodes]
          .sort((a, b) => a.episode_number - b.episode_number)
          .map((episode) => ({ episode, season: seasonResp.season }))
      );
  }, [seriesData]);

  const currentEntry = useMemo(
    () => episodeEntries.find((entry) => entry.episode.id === episodeId),
    [episodeEntries, episodeId]
  );

  const readyEntries = useMemo(
    () => episodeEntries.filter((entry) => entry.episode.status === 'READY' && entry.episode.video_url),
    [episodeEntries]
  );

  const navIndex = useMemo(
    () => readyEntries.findIndex((entry) => entry.episode.id === episodeId),
    [readyEntries, episodeId]
  );

  const prevEntry = navIndex > 0 ? readyEntries[navIndex - 1] : null;
  const nextEntry = navIndex >= 0 && navIndex < readyEntries.length - 1 ? readyEntries[navIndex + 1] : null;

  const streamUrl = useMemo(
    () => (episodeId ? seriesService.getEpisodeStreamUrl(episodeId) : ''),
    [episodeId]
  );
  const subtitleUrl = useMemo(() => {
    if (!currentEntry?.episode.subtitle_url) return undefined;
    return seriesService.getEpisodeSubtitleUrl(currentEntry.episode.id);
  }, [currentEntry]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }
    if (!isPlaying) return;
    hideTimerRef.current = window.setTimeout(() => {
      setControlsVisible(false);
    }, 2400);
  }, [isPlaying]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    showControls();

    if (video.paused) {
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.pause();
    }
  }, [showControls]);

  const handleSkip = useCallback(
    (amount: number) => {
      const video = videoRef.current;
      if (!video) return;
      const nextTime = clamp(video.currentTime + amount, 0, video.duration || 0);
      video.currentTime = nextTime;
      setCurrentTime(nextTime);
      showControls();
    },
    [showControls]
  );

  const handleSeekCommit = useCallback(
    (value: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = value;
      setCurrentTime(value);
      setSeekTime(value);
      showControls();
    },
    [showControls]
  );

  const handleSeekChange = useCallback((value: number) => {
    setSeekTime(value);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && video.volume === 0) {
      video.volume = 0.5;
      setVolume(0.5);
    }
    showControls();
  }, [showControls]);

  const handleVolumeChange = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    const next = clamp(value, 0, 1);
    video.volume = next;
    setVolume(next);
    const muted = next === 0;
    video.muted = muted;
    setIsMuted(muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    showControls();
  }, [showControls]);

  useEffect(() => {
    const handleFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreen);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    showControls();
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [showControls]);

  useEffect(() => {
    if (isPlaying) {
      showControls();
    }
  }, [isPlaying, showControls]);

  const handleKey = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
      }
      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        handleSkip(-SKIP_SECONDS);
      }
      if (event.code === 'ArrowRight') {
        event.preventDefault();
        handleSkip(SKIP_SECONDS);
      }
      if (event.code === 'KeyF') {
        event.preventDefault();
        toggleFullscreen();
      }
      if (event.code === 'KeyM') {
        event.preventDefault();
        toggleMute();
      }
    },
    [handleSkip, toggleFullscreen, toggleMute, togglePlay]
  );

  const episodeReady = currentEntry?.episode.status === 'READY' && currentEntry?.episode.video_url;

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-10">
        <div className="flex items-center justify-between gap-3 text-gray-300 mb-6">
          <Link
            to={`/series/${seriesId ?? ''}`}
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Series
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading episode...</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
            {error}
          </div>
        ) : !currentEntry ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
            Episode not found.
          </div>
        ) : !episodeReady ? (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 text-yellow-100">
            Episode is not ready to watch yet.
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm uppercase tracking-wide text-gray-400">
                {seriesData?.series.title}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold">
                {currentEntry.episode.title || `Episode ${currentEntry.episode.episode_number}`}
              </h1>
            </div>

            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
              onMouseMove={showControls}
              onClick={showControls}
              onKeyDown={handleKey}
              tabIndex={0}
              role="application"
              aria-label="Video player"
            >
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  src={streamUrl}
                  crossOrigin="anonymous"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={(event) => {
                    const target = event.currentTarget;
                    if (!isSeeking) {
                      setCurrentTime(target.currentTime);
                      setSeekTime(target.currentTime);
                    }
                  }}
                  onLoadedMetadata={(event) => {
                    setDuration(event.currentTarget.duration || 0);
                  }}
                  onSeeking={() => setIsBuffering(true)}
                  onSeeked={() => setIsBuffering(false)}
                  onWaiting={() => setIsBuffering(true)}
                  onCanPlay={() => setIsBuffering(false)}
                >
                  {subtitleUrl && (
                    <track
                      src={subtitleUrl}
                      kind="subtitles"
                      label="Subtitle"
                      srcLang="id"
                      default
                    />
                  )}
                </video>

                {isBuffering && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="w-10 h-10 animate-spin text-white" />
                  </div>
                )}

                <div
                  className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
                    controlsVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <div className="relative px-4 pb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                      </button>
                      <button
                        onClick={() => handleSkip(-SKIP_SECONDS)}
                        className="w-9 h-9 rounded-full border border-white/40 text-white flex items-center justify-center hover:border-white transition-colors"
                      >
                        <SkipBack className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSkip(SKIP_SECONDS)}
                        className="w-9 h-9 rounded-full border border-white/40 text-white flex items-center justify-center hover:border-white transition-colors"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={toggleMute}
                          className="w-9 h-9 rounded-full border border-white/40 text-white flex items-center justify-center hover:border-white transition-colors"
                        >
                          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.01}
                          value={volume}
                          onChange={(event) => handleVolumeChange(Number(event.target.value))}
                          className="w-24 accent-white"
                        />
                      </div>
                      <div className="ml-auto flex items-center gap-2 text-xs text-gray-300">
                        <span>{formatTime(currentTime)}</span>
                        <span className="text-gray-500">/</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <button
                        onClick={toggleFullscreen}
                        className="w-9 h-9 rounded-full border border-white/40 text-white flex items-center justify-center hover:border-white transition-colors"
                      >
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={duration || 0}
                      step={0.1}
                      value={isSeeking ? seekTime : currentTime}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        setIsSeeking(true);
                        handleSeekChange(value);
                      }}
                      onMouseUp={() => {
                        setIsSeeking(false);
                        handleSeekCommit(seekTime);
                      }}
                      onTouchEnd={() => {
                        setIsSeeking(false);
                        handleSeekCommit(seekTime);
                      }}
                      className="w-full accent-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to={prevEntry ? `/series/${seriesId}/episode/${prevEntry.episode.id}` : '#'}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  prevEntry ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-white/5 text-gray-500 pointer-events-none'
                }`}
              >
                <SkipBack className="w-4 h-4" />
                Prev Episode
              </Link>
              <Link
                to={nextEntry ? `/series/${seriesId}/episode/${nextEntry.episode.id}` : '#'}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  nextEntry ? 'bg-white text-black hover:bg-gray-200' : 'bg-white/5 text-gray-500 pointer-events-none'
                }`}
              >
                Next Episode
                <SkipForward className="w-4 h-4" />
              </Link>
              <span className="text-xs uppercase tracking-wide text-gray-500 ml-auto">
                {currentEntry.season.title || `Season ${currentEntry.season.season_number}`} · Episode {currentEntry.episode.episode_number}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
