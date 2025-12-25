import { useState } from 'react';
import { Search, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { PageHeader, ActionButton, DataTable } from '~/components/dashboard';

// Mock data
const mockMovies = [
  { id: '1', title: 'The Dark Knight', year: 2008, genre: 'Action', status: 'Published', views: '12.5M', thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100&q=80' },
  { id: '2', title: 'Inception', year: 2010, genre: 'Sci-Fi', status: 'Published', views: '8.2M', thumbnail: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=100&q=80' },
  { id: '3', title: 'Interstellar', year: 2014, genre: 'Sci-Fi', status: 'Published', views: '15.1M', thumbnail: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=100&q=80' },
  { id: '4', title: 'The Matrix 5', year: 2025, genre: 'Action', status: 'Draft', views: '0', thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=100&q=80' },
  { id: '5', title: 'Dune: Part Three', year: 2026, genre: 'Sci-Fi', status: 'Processing', views: '0', thumbnail: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=100&q=80' },
];

export default function MoviesManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredMovies = mockMovies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || movie.status.toLowerCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      key: 'title', 
      label: 'Movie',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-4">
          <img 
            src={row.thumbnail} 
            alt={row.title}
            className="w-16 h-10 object-cover rounded-lg"
          />
          <span className="text-white font-medium">{row.title}</span>
        </div>
      )
    },
    { key: 'year', label: 'Year' },
    { key: 'genre', label: 'Genre' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'Published' 
            ? 'bg-green-500/20 text-green-400'
            : value === 'Draft'
            ? 'bg-gray-500/20 text-gray-400'
            : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {value}
        </span>
      )
    },
    { key: 'views', label: 'Views' },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (_: any, row: any) => (
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    },
  ];

  return (
    <div className="p-8">
      <PageHeader 
        title="Movies" 
        description="Manage your movie library"
        action={<ActionButton label="Add Movie" icon={Plus} />}
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
            className="w-full bg-[#1a1a1a] border border-gray-800/50 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-[#1a1a1a] border border-gray-800/50 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="processing">Processing</option>
        </select>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filteredMovies} />

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <p className="text-gray-500 text-sm">Showing 1-5 of 1,234 movies</p>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            Previous
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg">1</button>
          <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">2</button>
          <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">3</button>
          <button className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
