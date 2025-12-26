import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { seriesService } from '~/services/series';
import type { SeriesListResponse } from '~/types';
import { Link, useNavigate } from 'react-router';

export default function SeriesManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [seriesList, setSeriesList] = useState<SeriesListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSeries();
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
            onClick={() => {
                // TODO: Implement create modal or page
                alert("Create Series Not Implemented Yet");
            }}
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
                            src={item.series.thumbnail_url} // Needs full URL handling if relative? Service/Component should handle this.
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
                        <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
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
    </div>
  );
}
