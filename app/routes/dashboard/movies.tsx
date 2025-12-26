import { useState, useEffect, useCallback } from 'react';
import { Search, Edit, Trash2, Eye, Plus, Loader2, AlertCircle, Upload, X, Film, Image as LucideImage } from 'lucide-react';
import { PageHeader, ActionButton, Modal } from '~/components/dashboard';
import { movieService, type MovieResponse, type CreateMovieRequest } from '~/services/movie';
import { genreService, type Genre } from '~/services/genre';

export default function MoviesManagement() {
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieResponse | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formGenreIds, setFormGenreIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Upload Modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'thumbnail'>('video');
  const [uploadMovieId, setUploadMovieId] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [transcodeProgress, setTranscodeProgress] = useState<Record<string, number>>({});

  // Fetch movies and genres
  const fetchData = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options;
    try {
      if (!silent) {
        setIsLoading(true);
        setError('');
      }

      if (silent) {
        const moviesData = await movieService.list();
        setMovies(moviesData);
        return;
      }

      const [moviesData, genresData] = await Promise.all([
        movieService.list(),
        genreService.list(),
      ]);
      setMovies(moviesData);
      setGenres(genresData);
    } catch (err: any) {
      if (!silent) {
        setError(err.response?.data?.message || 'Failed to load data');
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const processingIds = movies
      .filter((item) => item.movie.status === 'PROCESSING')
      .map((item) => item.movie.id);

    if (processingIds.length === 0) {
      setTranscodeProgress({});
      return;
    }

    const loadProgress = async () => {
      const results = await Promise.allSettled(
        processingIds.map((id) => movieService.getTranscodeProgress(id))
      );

      setTranscodeProgress((prev) => {
        const next: Record<string, number> = {};
        processingIds.forEach((id, index) => {
          const result = results[index];
          if (result.status === 'fulfilled') {
            next[id] = result.value;
          } else if (prev[id] !== undefined) {
            next[id] = prev[id];
          }
        });
        return next;
      });
    };

    loadProgress();

    const interval = setInterval(() => {
      fetchData({ silent: true });
      loadProgress();
    }, 5000);

    return () => clearInterval(interval);
  }, [movies, fetchData]);

  // Filter movies
  const filteredMovies = movies.filter(item => {
    const matchesSearch = item.movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || 
      (item.movie.status?.toLowerCase() || 'draft') === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Open create/edit modal
  const openModal = (movie?: MovieResponse) => {
    if (movie) {
      setEditingMovie(movie);
      setFormTitle(movie.movie.title);
      setFormDescription(movie.movie.description || '');
      setFormYear(movie.movie.release_year?.toString() || '');
      setFormDuration(movie.movie.duration_seconds?.toString() || '');
      setFormGenreIds(movie.genres.map(g => g.id));
    } else {
      setEditingMovie(null);
      setFormTitle('');
      setFormDescription('');
      setFormYear('');
      setFormDuration('');
      setFormGenreIds([]);
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMovie(null);
    setFormError('');
  };

  // Submit create/update
  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      setFormError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const data: CreateMovieRequest = {
        title: formTitle,
        description: formDescription || undefined,
        release_year: formYear ? parseInt(formYear) : undefined,
        duration_seconds: formDuration ? parseInt(formDuration) : undefined,
        genre_ids: formGenreIds,
      };

      if (editingMovie) {
        await movieService.update(editingMovie.movie.id, data);
      } else {
        await movieService.create(data);
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save movie');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete movie
  const handleDelete = async (movie: MovieResponse) => {
    if (!confirm(`Delete "${movie.movie.title}"?`)) return;
    
    try {
      await movieService.delete(movie.movie.id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete movie');
    }
  };

  // Open upload modal
  const openUploadModal = (movieId: string, type: 'video' | 'thumbnail' = 'video') => {
    setUploadMovieId(movieId);
    setUploadType(type);
    setUploadFile(null);
    setUploadProgress(0);
    setIsUploadModalOpen(true);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!uploadFile || !uploadMovieId) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (uploadType === 'video') {
        await movieService.uploadVideo(uploadMovieId, uploadFile, (percent) => {
          setUploadProgress(percent);
        });
      } else {
        await movieService.uploadThumbnail(uploadMovieId, uploadFile, (percent) => {
          setUploadProgress(percent);
        });
      }
      setIsUploadModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle genre selection
  const toggleGenre = (genreId: string) => {
    setFormGenreIds(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading movies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">Error Loading Movies</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={() => fetchData()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader 
        title="Movies" 
        description={`${movies.length} movies total`}
        action={<ActionButton label="Add Movie" icon={Plus} onClick={() => openModal()} />}
      />

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-800/50 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#1a1a1a] border border-gray-800/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="ready">Ready</option>
          <option value="draft">Draft</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800/50 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800/50">
              <th className="text-left text-gray-500 font-semibold text-sm uppercase tracking-wider px-6 py-4">Movie</th>
              <th className="text-left text-gray-500 font-semibold text-sm uppercase tracking-wider px-6 py-4">Year</th>
              <th className="text-left text-gray-500 font-semibold text-sm uppercase tracking-wider px-6 py-4">Duration</th>
              <th className="text-left text-gray-500 font-semibold text-sm uppercase tracking-wider px-6 py-4">Status</th>
              <th className="text-left text-gray-500 font-semibold text-sm uppercase tracking-wider px-6 py-4">Views</th>
              <th className="text-left text-gray-500 font-semibold text-sm uppercase tracking-wider px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMovies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  {searchQuery ? 'No movies found matching your search.' : 'No movies yet. Create your first one!'}
                </td>
              </tr>
            ) : (
              filteredMovies.map((item) => (
                <tr key={item.movie.id} className="border-b border-gray-800/30 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-10 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden relative">
                        {item.movie.thumbnail_url ? (
                          <img 
                            src={`${import.meta.env.VITE_API_BASE_URL}/movies/${item.movie.id}/thumbnail`}
                            alt={item.movie.title} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = ''; // Fallback
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Film className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.movie.title}</p>
                        <p className="text-gray-500 text-xs">
                          {item.genres.map(g => g.name).join(', ') || 'No genres'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{item.movie.release_year || '-'}</td>
                  <td className="px-6 py-4 text-gray-400">{movieService.formatDuration(item.movie.duration_seconds)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${movieService.getStatusColor(item.movie.status)}`}>
                        {item.movie.status || 'DRAFT'}
                      </span>
                      {item.movie.status === 'PROCESSING' && (
                        <>
                          <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
                          <span className="text-xs text-yellow-400">
                            {transcodeProgress[item.movie.id] ?? 0}%
                          </span>
                        </>
                      )}
                    </div>
                    {item.movie.status === 'PROCESSING' && (
                      <div className="mt-2 h-1.5 w-28 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-500 transition-all duration-500"
                          style={{ width: `${transcodeProgress[item.movie.id] ?? 0}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400">{item.movie.views?.toLocaleString() || '0'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => openUploadModal(item.movie.id, 'video')}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Upload Video"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openUploadModal(item.movie.id, 'thumbnail')}
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Upload Thumbnail"
                      >
                        <LucideImage className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => openModal(item)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingMovie ? 'Edit Movie' : 'Add New Movie'}
        footer={
          <div className="flex items-center gap-4">
            <button onClick={closeModal} disabled={isSubmitting} className="flex-1 px-4 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-white/5 font-medium disabled:opacity-50">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingMovie ? 'Update' : 'Create'}
            </button>
          </div>
        }
      >
        <div className="space-y-5 max-h-[60vh] overflow-y-auto">
          {formError && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-xl text-sm">
              {formError}
            </div>
          )}
          
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              placeholder="Movie title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full bg-black/30 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Movie description"
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-black/30 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Release Year</label>
              <input
                type="number"
                placeholder="2024"
                value={formYear}
                onChange={(e) => setFormYear(e.target.value)}
                className="w-full bg-black/30 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Duration (seconds)</label>
              <input
                type="number"
                placeholder="7200"
                value={formDuration}
                onChange={(e) => setFormDuration(e.target.value)}
                className="w-full bg-black/30 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Genres</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => toggleGenre(genre.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    formGenreIds.includes(genre.id)
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
              {genres.length === 0 && (
                <p className="text-gray-500 text-sm">No genres available. Create genres first.</p>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => !isUploading && setIsUploadModalOpen(false)}
        title={uploadType === 'video' ? "Upload Video" : "Upload Thumbnail"}
        footer={
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsUploadModalOpen(false)} 
              disabled={isUploading}
              className="flex-1 px-4 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-white/5 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload} 
              disabled={isUploading || !uploadFile}
              className={`flex-1 px-4 py-3 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 ${
                uploadType === 'video' ? 'bg-gradient-to-r from-blue-600 to-blue-700' : 'bg-gradient-to-r from-green-600 to-green-700'
              }`}
            >
              {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isUploading ? `Uploading ${uploadProgress}%` : 'Upload'}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              uploadFile 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            {uploadFile ? (
              <div className="flex items-center justify-center gap-3">
                {uploadType === 'video' ? (
                  <Film className="w-8 h-8 text-green-400" />
                ) : (
                  <LucideImage className="w-8 h-8 text-green-400" />
                )}
                <div className="text-left">
                  <p className="text-white font-medium">{uploadFile.name}</p>
                  <p className="text-gray-400 text-sm">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  onClick={() => setUploadFile(null)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                {uploadType === 'video' ? (
                  <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                ) : (
                  <LucideImage className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                )}
                <p className="text-white font-medium mb-1">Click to select {uploadType}</p>
                <p className="text-gray-500 text-sm">
                  {uploadType === 'video' ? 'MP4, WebM, or MKV' : 'JPG, PNG, or WEBP'}
                </p>
                <input
                  type="file"
                  accept={uploadType === 'video' ? "video/*" : "image/*"}
                  className="hidden"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
              </label>
            )}
          </div>

          {isUploading && (
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  uploadType === 'video' ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-green-500 to-green-600'
                }`}
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
