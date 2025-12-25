import { Link } from 'react-router';
import { Github, Twitter, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-black/90 border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Column 1 */}
          <div>
            <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-500 hover:text-white transition-colors text-sm">Home</Link></li>
              <li><Link to="/movies" className="text-gray-500 hover:text-white transition-colors text-sm">Movies</Link></li>
              <li><Link to="/series" className="text-gray-500 hover:text-white transition-colors text-sm">Series</Link></li>
              <li><Link to="/my-list" className="text-gray-500 hover:text-white transition-colors text-sm">My List</Link></li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-500 hover:text-white transition-colors text-sm">FAQ</Link></li>
              <li><Link to="/help" className="text-gray-500 hover:text-white transition-colors text-sm">Help Center</Link></li>
              <li><Link to="/contact" className="text-gray-500 hover:text-white transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-500 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-500 hover:text-white transition-colors text-sm">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-gray-500 hover:text-white transition-colors text-sm">Cookie Preferences</Link></li>
            </ul>
          </div>

          {/* Column 4 - Social */}
          <div>
            <h4 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              Connect
            </h4>
            <div className="flex gap-4">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
            HIURA
          </span>
          <p className="text-gray-600 text-sm">
            © {new Date().getFullYear()} HiuraMovie. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
