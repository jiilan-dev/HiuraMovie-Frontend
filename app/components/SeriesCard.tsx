import { Link } from 'react-router';
import { Play, ChevronDown } from 'lucide-react';
import { useState, type MouseEvent } from 'react';

interface SeriesCardProps {
  id: string;
  title: string;
  posterUrl?: string;
  year?: number;
  isDummy?: boolean;
  onDummyClick?: () => void;
}

export function SeriesCard({
  id,
  title,
  posterUrl = 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=400&q=80',
  year,
  isDummy = false,
  onDummyClick,
}: SeriesCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const handleDummyClick = (event: MouseEvent) => {
    if (!isDummy || !onDummyClick) return;
    event.preventDefault();
    onDummyClick();
  };

  return (
    <div
      className="relative flex-shrink-0 w-[200px] md:w-[240px] group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video rounded-md overflow-hidden bg-gray-800">
        <img
          src={posterUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Link
                to={`/series/${id}`}
                onClick={handleDummyClick}
                className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <Play className="w-4 h-4 text-black fill-current ml-0.5" />
              </Link>
              <Link
                to={`/series/${id}`}
                onClick={handleDummyClick}
                className="w-8 h-8 rounded-full border-2 border-gray-400 flex items-center justify-center hover:border-white transition-colors ml-auto"
              >
                <ChevronDown className="w-4 h-4 text-white" />
              </Link>
            </div>

            <h3 className="text-white text-sm font-semibold truncate">{title}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              {year && <span>{year}</span>}
              {!year && <span>Series</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
