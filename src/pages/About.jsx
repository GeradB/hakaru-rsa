import { siteContent } from '../content';

export default function About() {
  const { about } = siteContent;

  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 text-center leading-tight">
          {about.title}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          {about.subtitle}
        </p>

        {/* Main About Content */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            {about.content}
          </p>
        </div>

        {/* RNZRSA Section */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-rsa-gold rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-rsa-navy" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1 0a7 7 0 100-14 7 7 0 000 14z" clipRule="evenodd" />
                <path d="M10 6a1 1 0 110-2 1 1 0 010 2zM10 12a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-heading text-rsa-navy">
              {about.rnzrsa.title}
            </h2>
          </div>
          <div className="prose prose-lg max-w-none">
            {about.rnzrsa.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Mission */}
        <div className="bg-rsa-navy border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold font-heading mb-8 text-rsa-gold text-center">
            {about.mission.title}
          </h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {about.mission.items.map((item, index) => (
              <li key={index} className="flex items-start bg-white/5 rounded-lg p-4">
                <svg className="w-6 h-6 text-rsa-gold mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-lg">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
