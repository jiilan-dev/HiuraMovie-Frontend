import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { seriesService } from '~/services/series';
import { genreService, type Genre } from '~/services/genre';
import type { CreateSeriesRequest, SeriesListResponse } from '~/types';
import { Link, useNavigate } from 'react-router';
import { Modal } from '~/components/dashboard';

const resolveSeriesThumbnail = (thumb?: string, seriesId?: string) => {
  if (!thumb || !seriesId) return undefined;
  if (thumb.startsWith('http') || thumb.startsWith('/')) return thumb;
  return seriesService.getThumbnailUrl(seriesId);
};

export default function SeriesManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [seriesList, setSeriesList] = useState<SeriesListResponse[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<SeriesListResponse | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formGenreIds, setFormGenreIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSeries();
    loadGenres();
  }, []);

  const loadSeries = async () => {
    try {
      const data = await seriesService.list();
      setSeriesList(data);
    } catch (error) {
      console.error('Failed to load series:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGenres = async () => {
    try {
      const data = await genreService.list();
      setGenres(data);
    } catch (error) {
      console.error('Failed to load genres:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this series?')) {
      try {
        await seriesService.delete(id);
        loadSeries();
      } catch (error) {
        console.error('Failed to delete series:', error);
      }
    }
  };

  const openModal = (item?: SeriesListResponse) => {
    if (item) {
      setEditingSeries(item);
      setFormTitle(item.series.title);
      setFormDescription(item.series.description || '');
      setFormYear(item.series.release_year ? `${item.series.release_year}` : '');
      setFormGenreIds(item.genres.map((genre) => genre.id));
    } else {
      setEditingSeries(null);
      setFormTitle('');
      setFormDescription('');
      setFormYear('');
      setFormGenreIds([]);
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setFormError('');
    setEditingSeries(null);
  };

  const toggleGenre = (genreId: string) => {
    setFormGenreIds((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) {
      setFormError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload: CreateSeriesRequest = {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        release_year: formYear ? parseInt(formYear, 10) : undefined,
        genre_ids: formGenreIds,
      };
      if (editingSeries) {
        await seriesService.update(editingSeries.series.id, payload);
        closeModal();
        await loadSeries();
      } else {
        const created = await seriesService.create(payload);
        closeModal();
        await loadSeries();
        navigate(`/dashboard/series/${created.series.id}`);
      }
    } catch (error: any) {
      setFormError(error?.response?.data?.message || 'Failed to save series');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSeries = seriesList.filter(item => {
    const matchesSearch = item.series.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Series</h1>
          <p className="text-gray-500 mt-1">Manage your TV series library</p>
        </div>
        <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-5 h-5" />
          Add Series
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search series..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-gray-500">Loading series...</div>
        ) : (
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-500 font-medium p-4">Series</th>
              <th className="text-left text-gray-500 font-medium p-4">Release Year</th>
              <th className="text-left text-gray-500 font-medium p-4">Genres</th>
              <th className="text-left text-gray-500 font-medium p-4">Rating</th>
              <th className="text-left text-gray-500 font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSeries.length === 0 ? (
                <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">No series found.</td>
                </tr>
            ) : (
                filteredSeries.map((item) => (
                <tr key={item.series.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="p-4">
                    <div className="flex items-center gap-3">
                        {item.series.thumbnail_url ? (
                          <img 
                            src={resolveSeriesThumbnail(item.series.thumbnail_url, item.series.id)}
                            alt={item.series.title}
                            className="w-16 h-10 object-cover rounded"
                          />
                        ) : (
                            <div className="w-16 h-10 bg-gray-800 rounded flex items-center justify-center text-xs text-gray-500">No Img</div>
                        )}
                        <span className="text-white font-medium">{item.series.title}</span>
                    </div>
                    </td>
                    <td className="p-4 text-gray-400">{item.series.release_year || '-'}</td>
                    <td className="p-4 text-gray-400">
                        {item.genres.map(g => g.name).join(', ')}
                    </td>
                    <td className="p-4 text-gray-400">{item.series.rating || '-'}</td>
                    <td className="p-4">
                    <div className="flex items-center gap-2">
                        <Link to={`/dashboard/series/${item.series.id}`} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openModal(item)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                        >
                        <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(item.series.id)}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSeries ? 'Edit Series' : 'Add New Series'}
        footer={
          <div className="flex items-center gap-4">
            <button
              onClick={closeModal}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-white/5 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingSeries ? 'Save' : 'Create'}
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
              placeholder="Series title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full bg-black/30 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Description</label>
            <textarea
              placeholder="Series description"
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="w-full bg-black/30 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
            />
          </div>

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
    </div>
  );
}
