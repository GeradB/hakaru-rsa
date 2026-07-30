import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSiteContent } from '../context/SiteContentContext';

export default function Header() {
  const siteContent = useSiteContent();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href) =>
    href === '/'
      ? location.pathname === '/'
      : location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <header className="bg-rsa-navy text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-3 md:py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0 min-w-0">
            <div className="w-11 h-11 md:w-12 md:h-12 bg-rsa-gold rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
              <span className="text-rsa-navy font-bold text-xl">RSA</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold font-heading truncate">{siteContent.site.name}</h1>
              <p className="text-xs text-gray-300 truncate hidden sm:block">{siteContent.site.tagline}</p>
            </div>
          </Link>

          {/* Desktop Navigation — lg+ so many items stay on one line */}
          <nav className="hidden lg:block min-w-0 flex-1" aria-label="Main navigation">
            <ul className="flex flex-nowrap items-center justify-end gap-x-3 xl:gap-x-4">
              {siteContent.navigation.links.map((link) => (
                <li key={link.name} className="shrink-0">
                  <Link
                    to={link.href}
                    className={`whitespace-nowrap text-sm font-medium border-b-2 pb-0.5 transition-colors ${
                      isActive(link.href)
                        ? 'text-rsa-gold border-rsa-gold'
                        : 'text-white border-transparent hover:text-rsa-gold hover:border-rsa-gold'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile / tablet menu */}
          <button
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
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

        {mobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-white/10" aria-label="Mobile navigation">
            <ul className="space-y-2">
              {siteContent.navigation.links.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      isActive(link.href)
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
