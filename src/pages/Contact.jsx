import { siteContent } from '../content';

export default function Contact() {
  const { contact } = siteContent;

  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 text-center leading-tight">
          {contact.title}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Get in touch or visit us
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold font-heading text-rsa-navy mb-6">
              Contact Details
            </h2>
            <div className="space-y-5">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-rsa-gold mr-4 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-bold text-rsa-navy">Address</p>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(contact.address.street + ', ' + contact.address.city)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-rsa-gold hover:underline transition-colors"
                  >
                    {contact.address.street}
                  </a>
                  <p className="text-gray-700">{contact.address.city}</p>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-rsa-gold mr-4 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <div>
                  <p className="font-bold text-rsa-navy">Phone</p>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, '')}`}
                    className="text-gray-700 hover:text-rsa-gold hover:underline transition-colors"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <svg className="w-6 h-6 text-rsa-gold mr-4 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <div>
                  <p className="font-bold text-rsa-navy">Email</p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-gray-700 hover:text-rsa-gold hover:underline transition-colors"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="bg-rsa-navy border border-white/10 rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold font-heading text-rsa-gold mb-6">
              {contact.hours.title}
            </h2>
            <ul className="space-y-3">
              {contact.hours.items.map((item, index) => (
                <li key={index} className="flex justify-between border-b border-white/10 pb-2">
                  <span className="font-medium text-white">{item.day}</span>
                  <span className="text-rsa-gold font-medium">{item.hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mt-8 bg-white/10 rounded-2xl h-64 flex items-center justify-center">
          <p className="text-white/80">Map integration can be added here</p>
        </div>
      </div>
    </div>
  );
}
