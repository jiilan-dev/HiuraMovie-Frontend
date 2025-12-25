import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { PageHeader, ActionButton, Modal } from '~/components/dashboard';
import { genreService, type Genre } from '~/services/genre';

export default function GenresManagement() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch genres
  const fetchGenres = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await genreService.list();
      setGenres(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load genres');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // Filter genres
  const filteredGenres = genres.filter(genre => 
    genre.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open modal for create/edit
  const openModal = (genre?: Genre) => {
    if (genre) {
      setEditingGenre(genre);
      setFormName(genre.name);
      setFormSlug(genre.slug);
    } else {
      setEditingGenre(null);
      setFormName('');
      setFormSlug('');
    }
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGenre(null);
    setFormName('');
    setFormSlug('');
    setFormError('');
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setFormName(value);
    if (!editingGenre) {
      setFormSlug(value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!formName.trim() || !formSlug.trim()) {
      setFormError('Name and slug are required');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingGenre) {
        await genreService.update(editingGenre.id, { name: formName, slug: formSlug });
      } else {
        await genreService.create({ name: formName, slug: formSlug });
      }
      closeModal();
      fetchGenres();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save genre');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete genre
  const handleDelete = async (genre: Genre) => {
    if (!confirm(`Delete genre "${genre.name}"?`)) return;
    
    try {
      await genreService.delete(genre.id);
      fetchGenres();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete genre');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading genres...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-white font-medium mb-2">Error Loading Genres</p>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchGenres}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <PageHeader 
        title="Genres" 
        description={`${genres.length} genres total`}
        action={<ActionButton label="Add Genre" onClick={() => openModal()} />}
      />

      {/* Search */}
      <div className="relative max-w-md mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search genres..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-gray-800/50 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
        />
      </div>

      {/* Grid */}
      {filteredGenres.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {searchQuery ? 'No genres found matching your search.' : 'No genres yet. Create your first one!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredGenres.map((genre) => (
            <div 
              key={genre.id}
              className="group bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800/50 rounded-2xl p-6 hover:border-red-500/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-lg truncate">{genre.name}</h3>
                  <p className="text-gray-500 text-sm font-mono truncate">/{genre.slug}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openModal(genre)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(genre)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingGenre ? 'Edit Genre' : 'Add New Genre'}
        footer={
          <div className="flex items-center gap-4">
            <button 
              onClick={closeModal}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-gray-700 text-gray-400 rounded-xl hover:bg-white/5 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-500 hover:to-red-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingGenre ? 'Update' : 'Create'}
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {formError && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-xl text-sm">
              {formError}
            </div>
          )}
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Genre Name</label>
            <input
              type="text"
              placeholder="e.g. Action"
              value={formName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full bg-black/30 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Slug</label>
            <input
              type="text"
              placeholder="e.g. action"
              value={formSlug}
              onChange={(e) => setFormSlug(e.target.value)}
              className="w-full bg-black/30 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
