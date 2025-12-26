import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { seriesService } from '~/services/series';
import type { SeriesDetailResponse, SeasonResponse, Episode } from '~/types';
import { 
    ArrowLeft, Plus, Edit, Trash2, 
    ChevronDown, ChevronRight, Upload, Play, Image as ImageIcon,
    Save, X
} from 'lucide-react';

export default function SeriesDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [seriesData, setSeriesData] = useState<SeriesDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedSeasons, setExpandedSeasons] = useState<Record<string, boolean>>({});
    
    // Upload State
    const [uploading, setUploading] = useState<{ id: string, type: 'video' | 'thumbnail', progress: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTarget, setUploadTarget] = useState<{ episodeId: string, type: 'video' | 'thumbnail' } | null>(null);

    useEffect(() => {
        if (id) loadSeries(id);
    }, [id]);

    const loadSeries = async (seriesId: string) => {
        try {
            setLoading(true);
            const data = await seriesService.get(seriesId);
            setSeriesData(data);
            
            // Auto expand first season if exists
            if (data.seasons.length > 0) {
                setExpandedSeasons({ [data.seasons[0].season.id]: true });
            }
        } catch (error) {
            console.error('Failed to load series:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSeason = (seasonId: string) => {
        setExpandedSeasons(prev => ({
            ...prev,
            [seasonId]: !prev[seasonId]
        }));
    };

    const handleUploadClick = (episodeId: string, type: 'video' | 'thumbnail') => {
        setUploadTarget({ episodeId, type });
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !uploadTarget) return;

        const { episodeId, type } = uploadTarget;
        setUploading({ id: episodeId, type, progress: 0 });

        try {
            if (type === 'video') {
                await seriesService.uploadEpisodeVideo(episodeId, file, (progress) => {
                    setUploading(prev => prev ? { ...prev, progress } : null);
                });
            } else {
                await seriesService.uploadEpisodeThumbnail(episodeId, file, (progress) => {
                    setUploading(prev => prev ? { ...prev, progress } : null);
                });
            }
            
            // Refresh data
            if (id) await loadSeries(id);
            alert('Upload successful!');

        } catch (error) {
            console.error('Upload failed', error);
            alert('Upload failed');
        } finally {
            setUploading(null);
            setUploadTarget(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleAddSeason = async () => {
        if (!seriesData) return;
        const seasonNumber = seriesData.seasons.length + 1;
        if (confirm(`Create Season ${seasonNumber}?`)) {
            try {
                await seriesService.createSeason({
                    series_id: seriesData.series.id,
                    season_number: seasonNumber,
                    title: `Season ${seasonNumber}`
                });
                loadSeries(seriesData.series.id);
            } catch (e) {
                console.error(e);
                alert('Failed to create season');
            }
        }
    };

    const handleAddEpisode = async (seasonId: string, currentCount: number) => {
        const episodeNumber = currentCount + 1;
        if (confirm(`Create Episode ${episodeNumber}?`)) {
            try {
                await seriesService.createEpisode({
                    season_id: seasonId,
                    episode_number: episodeNumber,
                    title: `Episode ${episodeNumber}`,
                    description: '',
                    duration_seconds: 0
                });
                if (id) loadSeries(id);
            } catch (e) {
                console.error(e);
                alert('Failed to create episode');
            }
        }
    };

    const handleDeleteEpisode = async (episodeId: string) => {
        if (confirm('Delete this episode?')) {
             try {
                await seriesService.deleteEpisode(episodeId);
                if (id) loadSeries(id);
            } catch (e) {
                console.error(e);
                alert('Failed to delete episode');
            }
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
    if (!seriesData) return <div className="p-8 text-center text-red-500">Series not found</div>;

    const { series, genres, seasons } = seriesData;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange} 
                accept={uploadTarget?.type === 'video' ? "video/mp4,video/*" : "image/*"}
            />

            <button 
                onClick={() => navigate('/dashboard/series')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Series
            </button>

            {/* Header Info */}
            <div className="flex gap-8 mb-10">
                <div className="w-48 h-72 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                    {series.thumbnail_url ? (
                        <img src={series.thumbnail_url} alt={series.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">No Poster</div>
                    )}
                </div>
                <div className="flex-1">
                    <h1 className="text-4xl font-bold text-white mb-2">{series.title}</h1>
                    <div className="flex items-center gap-4 text-gray-400 mb-4">
                        <span>{series.release_year}</span>
                        <span>•</span>
                        <span>{genres.map(g => g.name).join(', ')}</span>
                        <span>•</span>
                        <span>{series.rating ? `${series.rating} ★` : 'No Rating'}</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-6">{series.description || 'No description available.'}</p>
                    
                    <div className="flex gap-3">
                         <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" /> Edit Series
                        </button>
                    </div>
                </div>
            </div>

            {/* Seasons & Episodes */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Seasons</h2>
                <button 
                    onClick={handleAddSeason}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-colors text-sm"
                >
                    <Plus className="w-4 h-4" /> Add Season
                </button>
            </div>

            <div className="space-y-4">
                {seasons.map((seasonResp) => (
                    <div key={seasonResp.season.id} className="border border-gray-800 rounded-lg bg-[#1a1a1a] overflow-hidden">
                        <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                            onClick={() => toggleSeason(seasonResp.season.id)}
                        >
                            <div className="flex items-center gap-3">
                                {expandedSeasons[seasonResp.season.id] ? (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                )}
                                <h3 className="font-semibold text-white">
                                    {seasonResp.season.title || `Season ${seasonResp.season.season_number}`}
                                </h3>
                                <span className="text-sm text-gray-500">({seasonResp.episodes.length} Episodes)</span>
                            </div>
                            <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                <button 
                                    onClick={() => handleAddEpisode(seasonResp.season.id, seasonResp.episodes.length)}
                                    className="p-1.5 text-gray-400 hover:text-green-400 rounded transition-colors" title="Add Episode"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-gray-400 hover:text-red-400 rounded transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {expandedSeasons[seasonResp.season.id] && (
                            <div className="border-t border-gray-800">
                                {seasonResp.episodes.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500 text-sm">No episodes yet. Click + to add one.</div>
                                ) : (
                                    <div className="divide-y divide-gray-800/50">
                                        {seasonResp.episodes.map(episode => (
                                            <div key={episode.id} className="p-4 flex flex-col md:flex-row gap-4 hover:bg-gray-800/20">
                                                {/* Thumbnail */}
                                                <div className="w-40 h-24 bg-gray-900 rounded flex-shrink-0 relative group">
                                                    {episode.thumbnail_url ? (
                                                        <img src={episode.thumbnail_url} className="w-full h-full object-cover rounded" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                                                            <ImageIcon className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <button 
                                                            onClick={() => handleUploadClick(episode.id, 'thumbnail')}
                                                            className="text-white text-xs bg-gray-800 px-2 py-1 rounded border border-gray-600"
                                                        >
                                                            Change Thumb
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-medium text-white truncate">
                                                            {episode.episode_number}. {episode.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <button 
                                                                onClick={() => handleDeleteEpisode(episode.id)}
                                                                className="text-gray-500 hover:text-red-500 p-1"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                                        {episode.description || 'No description'}
                                                    </p>

                                                    {/* Video Status / Upload */}
                                                    <div className="flex items-center gap-3">
                                                        {episode.video_url ? (
                                                            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded flex items-center gap-1">
                                                                <Play className="w-3 h-3" /> Ready
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded">
                                                                No Video
                                                            </span>
                                                        )}

                                                        <button 
                                                            onClick={() => handleUploadClick(episode.id, 'video')}
                                                            disabled={!!uploading}
                                                            className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
                                                        >
                                                            <Upload className="w-3 h-3" /> 
                                                            {episode.video_url ? 'Re-upload Video' : 'Upload Video'}
                                                        </button>
                                                        
                                                        {uploading?.id === episode.id && uploading.type === 'video' && (
                                                            <div className="flex-1 max-w-xs ml-2">
                                                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                                    <div 
                                                                        className="h-full bg-blue-500 transition-all duration-300"
                                                                        style={{ width: `${uploading.progress}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-[10px] text-gray-400 mt-1 block text-right">
                                                                    {uploading.progress}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
