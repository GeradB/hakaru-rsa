import { siteContent } from '../content';

export default function Events() {
  const { upcomingEvents } = siteContent;

  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 text-center leading-tight">
          Events & Entertainment
        </h1>
        <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Regular events for members and the community
        </p>

        {/* Weekly Events */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white mb-8">
            Weekly Events
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {upcomingEvents.events.map((event) => (
              <div
                key={event.id}
                className="bg-white/95 backdrop-blur rounded-xl shadow-xl p-6 border-l-4 border-rsa-gold hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
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
        </div>

        {/* Special Events Placeholder */}
        <div className="bg-white/95 backdrop-blur rounded-xl shadow-xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-rsa-navy mb-4">
            Special Events
          </h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            Keep an eye out for our special events including ANZAC Day commemorations,
            Poppy Day appeals, and seasonal celebrations.
          </p>
          <p className="text-gray-600 text-sm">
            Check back here or follow our social media for upcoming special event announcements.
          </p>
        </div>
      </div>
    </div>
  );
}
