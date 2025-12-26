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
import { movieService, type MovieResponse } from '~/services/movie';

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

export default function WatchMovie() {
  const { id } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<number | null>(null);

  const [movie, setMovie] = useState<MovieResponse | null>(null);
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
      } catch (err) {
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

  const streamUrl = useMemo(() => (id ? movieService.getStreamUrl(id) : ''), [id]);
  const subtitleUrl = useMemo(() => {
    if (!movie?.movie.subtitle_url) return undefined;
    return movieService.getSubtitleUrl(movie.movie.id);
  }, [movie]);
  const posterUrl = useMemo(() => {
    if (!movie?.movie.thumbnail_url) return undefined;
    return movieService.getThumbnailUrl(movie.movie.id);
  }, [movie]);

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

  const handleSkip = useCallback((amount: number) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = clamp(video.currentTime + amount, 0, video.duration || 0);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
    showControls();
  }, [showControls]);

  const handleSeekCommit = useCallback((value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = value;
    setCurrentTime(value);
    setSeekTime(value);
    showControls();
  }, [showControls]);

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

  const handleKey = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
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
  }, [handleSkip, toggleFullscreen, toggleMute, togglePlay]);

  return (
    <div className="min-h-screen bg-[#070707] text-white">
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-10">
        <div className="flex items-center gap-3 text-gray-300 mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading movie...</span>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-200">
            {error}
          </div>
        ) : (
          <>
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
                  className="w-full h-full"
                  src={streamUrl}
                  poster={posterUrl}
                  crossOrigin="anonymous"
                  onClick={togglePlay}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onWaiting={() => setIsBuffering(true)}
                  onPlaying={() => setIsBuffering(false)}
                  onTimeUpdate={(event) => {
                    const nextTime = event.currentTarget.currentTime;
                    if (!isSeeking) {
                      setCurrentTime(nextTime);
                      setSeekTime(nextTime);
                    }
                  }}
                  onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
                  onDurationChange={(event) => setDuration(event.currentTarget.duration)}
                  onVolumeChange={(event) => {
                    setVolume(event.currentTarget.volume);
                    setIsMuted(event.currentTarget.muted || event.currentTarget.volume === 0);
                  }}
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
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                )}

                {!isPlaying && !isBuffering && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur border border-white/20 shadow-lg">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </span>
                  </button>
                )}

                <div
                  className={`absolute inset-x-0 bottom-0 transition-opacity duration-300 ${
                    controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="bg-gradient-to-t from-black/90 via-black/60 to-transparent px-6 pb-6 pt-8">
                    <div className="flex flex-col gap-4">
                      <input
                        type="range"
                        min={0}
                        max={duration || 0}
                        step={0.1}
                        value={isSeeking ? seekTime : currentTime}
                        onChange={(event) => handleSeekChange(Number(event.target.value))}
                        onPointerDown={() => {
                          setIsSeeking(true);
                          showControls();
                        }}
                        onPointerUp={(event) => {
                          setIsSeeking(false);
                          const value = Number((event.target as HTMLInputElement).value);
                          handleSeekCommit(value);
                        }}
                        onPointerCancel={() => setIsSeeking(false)}
                        onKeyUp={(event) => {
                          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                            handleSeekCommit(seekTime);
                          }
                        }}
                        className="w-full accent-red-500"
                      />

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition"
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                          </button>

                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSkip(-SKIP_SECONDS)}
                              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition"
                            >
                              <SkipBack className="w-5 h-5" />
                            </button>
                            <span className="text-[10px] text-white/70 leading-none">-5s</span>
                          </div>

                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSkip(SKIP_SECONDS)}
                              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition"
                            >
                              <SkipForward className="w-5 h-5" />
                            </button>
                            <span className="text-[10px] text-white/70 leading-none">+5s</span>
                          </div>

                          <div className="flex items-center gap-2 ml-2">
                            <button
                              type="button"
                              onClick={toggleMute}
                              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition"
                            >
                              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </button>
                            <input
                              type="range"
                              min={0}
                              max={1}
                              step={0.01}
                              value={volume}
                              onChange={(event) => handleVolumeChange(Number(event.target.value))}
                              className="w-24 accent-red-500"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-white/80">
                          <span>{formatTime(currentTime)}</span>
                          <span className="text-white/40">/</span>
                          <span>{formatTime(duration)}</span>
                          <button
                            type="button"
                            onClick={toggleFullscreen}
                            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition"
                          >
                            <Maximize className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  {movie?.movie.title}
                </h1>
                <p className="text-gray-300 leading-relaxed">
                  {movie?.movie.description || 'No description available yet.'}
                </p>
                {movie?.genres?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/80"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <h2 className="text-sm uppercase tracking-wide text-white/60 mb-4">Details</h2>
                <div className="space-y-3 text-sm text-white/80">
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Release</span>
                    <span>{movie?.movie.release_year || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Duration</span>
                    <span>{movieService.formatDuration(movie?.movie.duration_seconds)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Status</span>
                    <span className="capitalize">{(movie?.movie.status || 'draft').toLowerCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50">Views</span>
                    <span>{movie?.movie.views?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="h-14" />

      {isFullscreen && (
        <div className="fixed inset-x-0 bottom-6 flex justify-center pointer-events-none">
          <div className="rounded-full bg-black/60 px-4 py-2 text-xs text-white/70 backdrop-blur">
            Tips: Space to play/pause, ← / → to skip 5s
          </div>
        </div>
      )}
    </div>
  );
}
