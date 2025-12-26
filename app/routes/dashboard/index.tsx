import { useEffect, useMemo, useState } from 'react';
import { Film, Tv, Users, Eye, Clock, Loader2 } from 'lucide-react';
import { StatsCard, PageHeader, DataTable } from '~/components/dashboard';
import { movieService, type MovieResponse } from '~/services/movie';

// Mock data for stats
const stats = [
  { label: 'Total Movies', value: '1,234', icon: Film, change: '+12%', trend: 'up' as const, color: 'blue' as const },
  { label: 'Total Series', value: '567', icon: Tv, change: '+8%', trend: 'up' as const, color: 'purple' as const },
  { label: 'Total Users', value: '45.2K', icon: Users, change: '+24%', trend: 'up' as const, color: 'green' as const },
  { label: 'Views Today', value: '12.5K', icon: Eye, change: '+18%', trend: 'up' as const, color: 'orange' as const },
];

const recentActivity = [
  { id: 1, action: 'New user registered', user: 'john_doe', time: '2 min ago' },
  { id: 2, action: 'Movie uploaded', user: 'admin', time: '15 min ago' },
  { id: 3, action: 'Series updated', user: 'admin', time: '1 hour ago' },
  { id: 4, action: 'New review posted', user: 'jane_smith', time: '2 hours ago' },
];

export default function DashboardOverview() {
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setMoviesLoading(true);
        setMoviesError('');
        const data = await movieService.list();
        setMovies(data);
      } catch (err: any) {
        setMoviesError(err?.response?.data?.message || 'Failed to load movies');
      } finally {
        setMoviesLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';
  const movieRows = useMemo(() => (
    movies.slice(0, 5).map((item) => ({
      id: item.movie.id,
      title: item.movie.title,
      release_year: item.movie.release_year,
      status: item.movie.status || 'DRAFT',
      views: item.movie.views ?? 0,
      thumbnail_url: item.movie.thumbnail_url,
    }))
  ), [movies]);

  const contentColumns = useMemo(() => ([
    { 
      key: 'title', 
      label: 'Movie',
      render: (value: string, row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-14 h-9 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
            {row.thumbnail_url ? (
              <img
                src={`${apiBaseUrl}/movies/${row.id}/thumbnail`}
                alt={value}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Film className="w-4 h-4 text-gray-600" />
            )}
          </div>
          <span className="text-white font-medium">{value}</span>
        </div>
      )
    },
    { 
      key: 'release_year', 
      label: 'Year',
      render: (value: number | undefined) => (
        <span className="text-gray-300">{value || '-'}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${movieService.getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    { 
      key: 'views', 
      label: 'Views',
      render: (value: number) => (
        <span className="text-gray-300">{value.toLocaleString()}</span>
      )
    },
  ]), [apiBaseUrl]);

  return (
    <div className="p-8">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back! Here's what's happening with your platform." 
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatsCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Content */}
        <div className="xl:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4">Latest Movies</h2>
          {moviesLoading ? (
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800/50 rounded-2xl p-8 text-center">
              <Loader2 className="w-6 h-6 text-red-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-400">Loading movies...</p>
            </div>
          ) : moviesError ? (
            <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800/50 rounded-2xl p-8 text-center">
              <p className="text-red-400 mb-2">Failed to load movies</p>
              <p className="text-gray-500 text-sm">{moviesError}</p>
            </div>
          ) : (
            <DataTable columns={contentColumns} data={movieRows} />
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800/50 rounded-2xl p-4">
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{activity.action}</p>
                    <p className="text-gray-500 text-xs">by {activity.user}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 text-xs flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
