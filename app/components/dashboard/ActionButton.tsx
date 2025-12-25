import { Plus, type LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function ActionButton({ label, onClick, icon: Icon = Plus, variant = 'primary' }: ActionButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/20',
    secondary: 'bg-white/10 hover:bg-white/20 text-white border border-gray-700',
    danger: 'bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white',
  };

  return (
    <button 
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-200 ${variants[variant]}`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );
}
