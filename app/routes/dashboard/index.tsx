import { Film, Tv, Users, Eye, Clock } from 'lucide-react';
import { StatsCard, PageHeader, DataTable } from '~/components/dashboard';

// Mock data for stats
const stats = [
  { label: 'Total Movies', value: '1,234', icon: Film, change: '+12%', trend: 'up' as const, color: 'blue' as const },
  { label: 'Total Series', value: '567', icon: Tv, change: '+8%', trend: 'up' as const, color: 'purple' as const },
  { label: 'Total Users', value: '45.2K', icon: Users, change: '+24%', trend: 'up' as const, color: 'green' as const },
  { label: 'Views Today', value: '12.5K', icon: Eye, change: '+18%', trend: 'up' as const, color: 'orange' as const },
];

const recentContent = [
  { id: 1, title: 'Stranger Things S5', type: 'Series', status: 'Published', views: '2.3M' },
  { id: 2, title: 'The Batman 2', type: 'Movie', status: 'Draft', views: '0' },
  { id: 3, title: 'Dune: Part Three', type: 'Movie', status: 'Published', views: '1.8M' },
  { id: 4, title: 'Wednesday S2', type: 'Series', status: 'Processing', views: '0' },
  { id: 5, title: 'Avatar 3', type: 'Movie', status: 'Published', views: '5.2M' },
];

const recentActivity = [
  { id: 1, action: 'New user registered', user: 'john_doe', time: '2 min ago' },
  { id: 2, action: 'Movie uploaded', user: 'admin', time: '15 min ago' },
  { id: 3, action: 'Series updated', user: 'admin', time: '1 hour ago' },
  { id: 4, action: 'New review posted', user: 'jane_smith', time: '2 hours ago' },
];

const contentColumns = [
  { 
    key: 'title', 
    label: 'Title',
    render: (value: string) => <span className="text-white font-medium">{value}</span>
  },
  { 
    key: 'type', 
    label: 'Type',
    render: (value: string) => (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        value === 'Movie' 
          ? 'bg-blue-500/20 text-blue-400' 
          : 'bg-purple-500/20 text-purple-400'
      }`}>
        {value}
      </span>
    )
  },
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
];

export default function DashboardOverview() {
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
          <h2 className="text-xl font-bold text-white mb-4">Recent Content</h2>
          <DataTable columns={contentColumns} data={recentContent} />
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
