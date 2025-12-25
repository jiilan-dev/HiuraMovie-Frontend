import { Link } from 'react-router';
import { Play, Plus, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface MovieCardProps {
  id: string;
  title: string;
  posterUrl?: string;
  year?: number;
  duration?: string;
}

export function MovieCard({ 
  id, 
  title, 
  posterUrl = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80",
  year,
  duration
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative flex-shrink-0 w-[200px] md:w-[240px] group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-md overflow-hidden bg-gray-800">
        <img 
          src={posterUrl} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-2">
              <Link 
                to={`/watch/${id}`}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Play className="w-4 h-4 text-black fill-current ml-0.5" />
              </Link>
              <button className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors">
                <Plus className="w-4 h-4 text-white" />
              </button>
              <Link 
                to={`/movie/${id}`}
                className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors ml-auto"
              >
                <ChevronDown className="w-4 h-4 text-white" />
              </Link>
            </div>
            
            {/* Info */}
            <h3 className="text-white text-sm font-semibold truncate">{title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {year && <span>{year}</span>}
              {duration && <span>{duration}</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
