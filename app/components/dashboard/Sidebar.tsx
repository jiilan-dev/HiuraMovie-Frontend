import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Film, 
  Tv, 
  Users, 
  Tags, 
  ChevronLeft,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '~/contexts/auth-context';
import { useNavigate } from 'react-router';

const sidebarItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/movies', label: 'Movies', icon: Film },
  { path: '/dashboard/series', label: 'Series', icon: Tv },
  { path: '/dashboard/genres', label: 'Genres', icon: Tags },
  { path: '/dashboard/users', label: 'Users', icon: Users },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] border-r border-gray-800/50 flex flex-col">
      {/* Logo Section */}
      <div className="p-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors text-sm group mb-6"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Site</span>
        </Link>
        <Link to="/dashboard" className="block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white block">HIURA</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Admin Panel</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-4">Menu</p>
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? '' : 'group-hover:text-red-400'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-white/80" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{user?.username}</p>
              <p className="text-xs text-red-400 font-medium">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200 font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
