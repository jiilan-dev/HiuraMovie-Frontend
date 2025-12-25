import { Outlet } from 'react-router';
import { Navbar } from '~/components/Navbar';
import { Footer } from '~/components/Footer';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
