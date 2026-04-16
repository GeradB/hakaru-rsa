import { Link } from 'react-router-dom';
import { siteContent } from '../content';

export default function Footer() {
  const { footer, contact } = siteContent;

  return (
    <footer className="bg-rsa-navy text-white py-12" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-4 group">
              <div className="w-10 h-10 bg-rsa-gold rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-rsa-navy font-bold text-lg">RSA</span>
              </div>
              <h3 className="text-lg font-bold font-heading">{siteContent.site.name}</h3>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">{siteContent.site.tagline}</p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer navigation">
            <h4 className="font-bold font-heading mb-4 text-rsa-gold">Quick Links</h4>
            <ul className="space-y-2">
              {footer.quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-rsa-gold transition-colors inline-block hover:underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h4 className="font-bold font-heading mb-4 text-rsa-gold">Contact Us</h4>
            <address className="not-italic space-y-2 text-gray-400 text-sm">
              <p>{contact.address.street}</p>
              <p>{contact.address.city}</p>
              <p>
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:text-rsa-gold transition-colors">
                  {contact.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${contact.email}`} className="hover:text-rsa-gold transition-colors">
                  {contact.email}
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          {footer.copyright}
        </div>
      </div>
    </footer>
  );
}
