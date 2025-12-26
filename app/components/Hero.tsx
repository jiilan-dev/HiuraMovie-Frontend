import { Play, Info } from 'lucide-react';
import { Link } from 'react-router';
import type { MouseEvent } from 'react';

interface HeroProps {
  title?: string;
  description?: string;
  backgroundImage?: string;
  movieId?: string;
  primaryHref?: string;
  secondaryHref?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

export function Hero({ 
  title = "Stranger Things", 
  description = "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
  backgroundImage = "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&q=80",
  movieId = "1",
  primaryHref,
  secondaryHref,
  onPrimaryAction,
  onSecondaryAction
}: HeroProps) {
  const primaryLink = primaryHref ?? `/watch/${movieId}`;
  const secondaryLink = secondaryHref ?? `/movie/${movieId}`;

  const handlePrimaryClick = (event: MouseEvent) => {
    if (!onPrimaryAction) return;
    event.preventDefault();
    onPrimaryAction();
  };

  const handleSecondaryClick = (event: MouseEvent) => {
    if (!onSecondaryAction) return;
    event.preventDefault();
    onSecondaryAction();
  };

  return (
    <section className="relative h-[85vh] min-h-[600px] flex items-end">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 w-full">
        <div className="max-w-xl">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            {title}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-200 mb-8 line-clamp-3 drop-shadow-md">
            {description}
          </p>

          {/* Buttons */}
          <div className="flex gap-4">
            <Link 
              to={primaryLink}
              onClick={handlePrimaryClick}
              className="flex items-center gap-2 px-8 py-3 bg-white text-black font-semibold rounded hover:bg-gray-200 transition-colors"
            >
              <Play className="w-6 h-6 fill-current" />
              Play
            </Link>
            <Link 
              to={secondaryLink}
              onClick={handleSecondaryClick}
              className="flex items-center gap-2 px-8 py-3 bg-gray-500/70 text-white font-semibold rounded hover:bg-gray-500/90 transition-colors backdrop-blur-sm"
            >
              <Info className="w-6 h-6" />
              More Info
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
