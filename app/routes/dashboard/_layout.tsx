import { Outlet, Link } from 'react-router';
import { Loader2, ShieldX } from 'lucide-react';
import { useAuth } from '~/contexts/auth-context';
import { useEffect, useState } from 'react';
import { DashboardSidebar } from '~/components/dashboard';

export default function DashboardLayout() {
  const { user, isLoading } = useAuth();
  const [checkComplete, setCheckComplete] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setCheckComplete(true);
    }
  }, [isLoading]);

  // Show loading while checking auth
  if (isLoading || !checkComplete) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30 animate-pulse">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-400 font-medium">Checking access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
            <ShieldX className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Authentication Required</h1>
          <p className="text-gray-400 mb-8">Please sign in to access the admin dashboard.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg shadow-red-500/20"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Not admin - access denied
  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
            <ShieldX className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Access Denied</h1>
          <p className="text-gray-400 mb-8">
            You don't have permission to access the admin dashboard. 
            This area is restricted to administrators only.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-lg shadow-red-500/20"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto bg-gradient-to-br from-[#0a0a0a] to-[#111]">
        <Outlet />
      </main>
    </div>
  );
}
