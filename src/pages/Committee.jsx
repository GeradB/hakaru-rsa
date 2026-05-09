import { useSiteContent } from '../context/SiteContentContext';

function MemberAvatar({ imageUrl }) {
  if (imageUrl?.trim?.()) {
    return (
      <img
        src={imageUrl.trim()}
        alt=""
        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-2 ring-rsa-gold/50"
      />
    );
  }
  return (
    <div className="w-24 h-24 bg-rsa-gold rounded-full mx-auto mb-4 flex items-center justify-center">
      <svg className="w-12 h-12 text-rsa-navy" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
      </svg>
    </div>
  );
}

export default function Committee() {
  const siteContent = useSiteContent();
  const { committeePage, contact } = siteContent;
  const cp = committeePage || {};
  const members = cp.members || [];

  return (
    <div className="bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 text-center leading-tight">
          {cp.title || 'Executive Committee'}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          {cp.subtitle || 'Hakaru & Districts RSA'}
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {members.map((m, idx) => (
            <div
              key={`${m.name}-${idx}`}
              className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center hover:shadow-3xl hover:-translate-y-1 transition-all duration-300"
            >
              <MemberAvatar imageUrl={m.imageUrl} />
              <h3 className="text-xl font-bold font-heading text-rsa-navy mb-1">{m.name}</h3>
              <p className="text-rsa-gold font-bold mb-3">{m.role}</p>
              <p className="text-gray-600 text-sm">{m.bio}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold font-heading text-rsa-navy mb-4">
            {cp.contactSection?.title || 'Contact the Committee'}
          </h2>
          <p className="text-gray-700 mb-6 max-w-xl mx-auto">
            {cp.contactSection?.body ||
              'Have a question or concern? The Executive Committee is here to help.'}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`mailto:${contact?.email || ''}`}
              className="inline-flex items-center bg-rsa-gold text-rsa-navy px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email Us
            </a>
            <a
              href="/contact"
              className="inline-flex items-center border-2 border-rsa-navy text-rsa-navy px-6 py-3 rounded-lg font-bold hover:bg-rsa-navy hover:text-white transition-all"
            >
              View Contact Details
            </a>
          </div>
        </div>

        <div className="mt-8 bg-rsa-navy/50 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-gray-300 text-sm">
            <span className="font-bold text-rsa-gold">Note:</span>{' '}
            {cp.note ||
              'Committee positions are filled by elected members. Elections are held annually.'}
          </p>
        </div>
      </div>
    </div>
  );
}
