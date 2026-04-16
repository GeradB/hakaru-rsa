import { siteContent } from '../content';

export default function Membership() {
  const { membership } = siteContent;

  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 text-center leading-tight">
          {membership.title}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          {membership.subtitle}
        </p>

        {/* Membership Types */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {membership.types.map((type, index) => (
            <div
              key={type.name}
              className={`rounded-2xl shadow-2xl p-8 border-t-4 ${
                index === 0 ? 'bg-rsa-navy border-rsa-gold' : 'bg-white/95 backdrop-blur border-rsa-navy'
              } hover:shadow-3xl hover:-translate-y-1 transition-all duration-300`}
            >
              <h2 className={`text-2xl font-bold font-heading mb-2 ${
                index === 0 ? 'text-white' : 'text-rsa-navy'
              }`}>
                {type.name}
              </h2>
              <p className={`text-4xl font-bold mb-4 ${
                index === 0 ? 'text-rsa-gold' : 'text-rsa-navy'
              }`}>
                {type.price}
              </p>
              <p className={`mb-6 ${index === 0 ? 'text-gray-300' : 'text-gray-600'}`}>
                {type.description}
              </p>
              <ul className="space-y-3">
                {type.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start">
                    <svg className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 ${
                      index === 0 ? 'text-rsa-gold' : 'text-rsa-gold'
                    }`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className={index === 0 ? 'text-white' : 'text-gray-700'}>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* How to Join */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-rsa-navy mb-6">
            How to Join
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {membership.howToJoin}
          </p>
        </div>
      </div>
    </div>
  );
}
