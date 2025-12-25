import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

// Mock data
const mockSeries = [
  { id: '1', title: 'Stranger Things', seasons: 5, genre: 'Sci-Fi', status: 'Published', views: '45.2M', thumbnail: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=100&q=80' },
  { id: '2', title: 'Breaking Bad', seasons: 5, genre: 'Drama', status: 'Published', views: '38.1M', thumbnail: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=100&q=80' },
  { id: '3', title: 'The Witcher', seasons: 3, genre: 'Fantasy', status: 'Published', views: '22.5M', thumbnail: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=100&q=80' },
  { id: '4', title: 'Wednesday', seasons: 2, genre: 'Comedy', status: 'Processing', views: '18.3M', thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&q=80' },
  { id: '5', title: 'Squid Game', seasons: 2, genre: 'Thriller', status: 'Published', views: '67.8M', thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=100&q=80' },
];

export default function SeriesManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredSeries = mockSeries.filter(series => {
    const matchesSearch = series.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || series.status.toLowerCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Series</h1>
          <p className="text-gray-500 mt-1">Manage your TV series library</p>
        </div>
        <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors">
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
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#1a1a1a] border border-gray-800 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="processing">Processing</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-500 font-medium p-4">Series</th>
              <th className="text-left text-gray-500 font-medium p-4">Seasons</th>
              <th className="text-left text-gray-500 font-medium p-4">Genre</th>
              <th className="text-left text-gray-500 font-medium p-4">Status</th>
              <th className="text-left text-gray-500 font-medium p-4">Views</th>
              <th className="text-left text-gray-500 font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSeries.map((series) => (
              <tr key={series.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={series.thumbnail} 
                      alt={series.title}
                      className="w-16 h-10 object-cover rounded"
                    />
                    <span className="text-white font-medium">{series.title}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-400">{series.seasons} seasons</td>
                <td className="p-4 text-gray-400">{series.genre}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    series.status === 'Published' 
                      ? 'bg-green-500/20 text-green-400'
                      : series.status === 'Draft'
                      ? 'bg-gray-500/20 text-gray-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {series.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400">{series.views}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-800">
          <p className="text-gray-500 text-sm">Showing 1-5 of 567 series</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
              Previous
            </button>
            <button className="px-3 py-1 bg-red-600 text-white rounded">1</button>
            <button className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">2</button>
            <button className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">3</button>
            <button className="px-3 py-1 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
