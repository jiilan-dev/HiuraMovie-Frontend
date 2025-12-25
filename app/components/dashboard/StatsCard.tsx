import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  trend?: 'up' | 'down';
  color?: 'red' | 'blue' | 'green' | 'purple' | 'orange';
}

const colorMap = {
  red: 'from-red-500 to-red-700',
  blue: 'from-blue-500 to-blue-700',
  green: 'from-green-500 to-green-700',
  purple: 'from-purple-500 to-purple-700',
  orange: 'from-orange-500 to-orange-700',
};

export function StatsCard({ label, value, icon: Icon, change, trend = 'up', color = 'red' }: StatsCardProps) {
  return (
    <div className="group relative bg-gradient-to-br from-[#1a1a1a] to-[#111] border border-gray-800/50 rounded-2xl p-6 hover:border-gray-700/50 transition-all duration-300 overflow-hidden">
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          {change && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              trend === 'up' 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </div>
          )}
        </div>
        <p className="text-4xl font-bold text-white mb-1">{value}</p>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
      </div>
    </div>
  );
}
