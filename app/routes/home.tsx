import { Hero } from '~/components/Hero';
import { MovieRow } from '~/components/MovieRow';

// Mock data - replace with loader data from API
const MOCK_MOVIES = [
  { id: '1', title: 'Stranger Things', year: 2016, duration: '50m', posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&q=80' },
  { id: '2', title: 'Breaking Bad', year: 2008, duration: '47m', posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400&q=80' },
  { id: '3', title: 'The Witcher', year: 2019, duration: '60m', posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400&q=80' },
  { id: '4', title: 'Dark', year: 2017, duration: '55m', posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80' },
  { id: '5', title: 'Money Heist', year: 2017, duration: '45m', posterUrl: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=400&q=80' },
  { id: '6', title: 'Squid Game', year: 2021, duration: '55m', posterUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&q=80' },
  { id: '7', title: 'Lucifer', year: 2016, duration: '42m', posterUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=80' },
  { id: '8', title: 'The Crown', year: 2016, duration: '58m', posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&q=80' },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <Hero 
        title="Stranger Things"
        description="When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl."
        backgroundImage="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1920&q=80"
        movieId="1"
      />

      {/* Movie Rows */}
      <div className="mt-8 relative z-10 space-y-8 pb-12">
        <MovieRow 
          title="Trending Now" 
          movies={MOCK_MOVIES} 
        />
        <MovieRow 
          title="Popular on HIURA" 
          movies={[...MOCK_MOVIES].reverse()} 
        />
        <MovieRow 
          title="New Releases" 
          movies={MOCK_MOVIES.slice(0, 6)} 
        />
        <MovieRow 
          title="Action & Adventure" 
          movies={MOCK_MOVIES.slice(2, 8)} 
        />
      </div>
    </>
  );
}
