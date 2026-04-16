import { Link } from 'react-router-dom';
import { siteContent } from '../content';

export default function Home() {
  const { hero, welcome, announcements, upcomingEvents } = siteContent;

  console.log('Home component rendering', { hero, welcome });

  return (
    <div className="bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        </div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-heading leading-tight">
            {hero.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            {hero.subtitle}
          </p>
          <Link
            to={hero.ctaLink}
            className="inline-flex items-center bg-rsa-gold text-rsa-navy px-8 py-4 rounded-md font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-rsa-gold/50"
          >
            {hero.ctaText}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-rsa-navy mb-6">
              {welcome.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              {welcome.content}
            </p>
          </div>
        </div>
      </section>

      {/* Announcements */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4 text-center">
            {announcements.title}
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Stay up to date with the latest news and happenings at Hakaru RSA
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.items.map((item) => (
              <div
                key={item.id}
                className="bg-white/95 backdrop-blur rounded-xl shadow-xl p-6 border-t-4 border-rsa-gold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <span className="text-4xl mb-4 block" aria-hidden="true">{item.emoji}</span>
                <h3 className="text-xl font-bold font-heading text-rsa-navy mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-white mb-4 text-center">
            {upcomingEvents.title}
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Join us for regular events and special occasions
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.events.map((event) => (
              <div
                key={event.id}
                className="bg-white/95 backdrop-blur rounded-xl shadow-xl p-6 border-l-4 border-rsa-red hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <h3 className="text-xl font-bold font-heading text-rsa-navy mb-3">
                  {event.title}
                </h3>
                <div className="flex items-center text-rsa-gold font-bold mb-2">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {event.date}
                </div>
                <p className="text-gray-500 text-sm mb-2">{event.time}</p>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/events"
              className="inline-flex items-center border-2 border-white text-white px-8 py-3 rounded-md font-bold text-lg hover:bg-white hover:text-rsa-navy transition-all focus:ring-4 focus:ring-white/50"
            >
              View All Events
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-rsa-gold rounded-2xl shadow-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-rsa-navy mb-4">
              Ready to Join Our Community?
            </h2>
            <p className="text-rsa-navy/80 mb-8 max-w-xl mx-auto">
              Become a member today and enjoy access to all our facilities, events, and a supportive community of veterans and locals.
            </p>
            <Link
              to="/membership"
              className="inline-flex items-center bg-rsa-navy text-white px-8 py-4 rounded-md font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 focus:ring-4 focus:ring-rsa-navy/50"
            >
              Become a Member
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
