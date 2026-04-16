import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { siteContent } from '../content';

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-rsa-navy text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-rsa-gold rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-rsa-navy font-bold text-xl">RSA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold font-heading">{siteContent.site.name}</h1>
              <p className="text-xs text-gray-300">{siteContent.site.tagline}</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block" aria-label="Main navigation">
            <ul className="flex space-x-6">
              {siteContent.navigation.links.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className={`transition-colors font-medium ${
                      location.pathname === link.href
                        ? 'text-rsa-gold border-b-2 border-rsa-gold pb-1'
                        : 'text-white hover:text-rsa-gold hover:border-b-2 hover:border-rsa-gold pb-1'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/10" aria-label="Mobile navigation">
            <ul className="space-y-2">
              {siteContent.navigation.links.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === link.href
                        ? 'bg-rsa-gold text-rsa-navy font-medium'
                        : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
