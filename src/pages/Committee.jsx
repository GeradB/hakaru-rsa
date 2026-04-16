import { siteContent } from '../content';

export default function Committee() {
  return (
    <div className="bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 text-center leading-tight">
          Executive Committee
        </h1>
        <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Hakaru & Districts RSA
        </p>

        {/* Committee Members Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* President */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-24 h-24 bg-rsa-gold rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-rsa-navy" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-heading text-rsa-navy mb-1">President Name</h3>
            <p className="text-rsa-gold font-bold mb-3">President</p>
            <p className="text-gray-600 text-sm">Leading our RSA with dedication to veterans and community.</p>
          </div>

          {/* Vice President */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-24 h-24 bg-rsa-gold rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-rsa-navy" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-heading text-rsa-navy mb-1">Vice President Name</h3>
            <p className="text-rsa-gold font-bold mb-3">Vice President</p>
            <p className="text-gray-600 text-sm">Supporting the President and RSA operations.</p>
          </div>

          {/* Secretary */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-24 h-24 bg-rsa-gold rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-rsa-navy" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7a1 1 0 11-2 0v2a1 1 0 11-2 0V5a1 1 0 011-1H6a1 1 0 011-1V2a1 1 0 011-1h4a1 1 0 011 1v2H8a3 3 0 00-3 3v7a1 1 0 102 0V8a1 1 0 112 0v7a3 3 0 003 3h2a4 4 0 004-4V4a2 2 0 00-2-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-heading text-rsa-navy mb-1">Secretary Name</h3>
            <p className="text-rsa-gold font-bold mb-3">Secretary</p>
            <p className="text-gray-600 text-sm">Managing communications and records.</p>
          </div>

          {/* Treasurer */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-24 h-24 bg-rsa-gold rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-rsa-navy" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267zM5.468 5.213a3.026 3.026 0 01.471-.169A7.03 7.03 0 0110 5c1.072 0 2.097.184 3.061.526.422.149.823.338 1.202.562.257.152.5.32.732.502a1.001 1.001 0 01.376 1.13l-.202.545a1 1 0 01-1.402.56 5.006 5.006 0 00-1.285-.514A5.03 5.03 0 0010 7c-.682 0-1.335.133-1.936.376a1 1 0 01-1.298-.565l-.202-.545a1 1 0 01.376-1.13 7.034 7.034 0 011.528-.923zM5 10a1 1 0 100 2 1 1 0 000-2zm4 1a1 1 0 112 0 1 1 0 01-2 0zm5 1a1 1 0 100-2 1 1 0 000 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-heading text-rsa-navy mb-1">Treasurer Name</h3>
            <p className="text-rsa-gold font-bold mb-3">Treasurer</p>
            <p className="text-gray-600 text-sm">Managing finances and accounts.</p>
          </div>

          {/* Committee Member */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-heading text-rsa-navy mb-1">Member Name</h3>
            <p className="text-rsa-gold font-bold mb-3">Committee Member</p>
            <p className="text-gray-600 text-sm">Serving the RSA community.</p>
          </div>

          {/* Committee Member */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold font-heading text-rsa-navy mb-1">Member Name</h3>
            <p className="text-rsa-gold font-bold mb-3">Committee Member</p>
            <p className="text-gray-600 text-sm">Serving the RSA community.</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold font-heading text-rsa-navy mb-4">
            Contact the Committee
          </h2>
          <p className="text-gray-700 mb-6 max-w-xl mx-auto">
            Have a question or concern? The Executive Committee is here to help.
            Reach out to us via email or visit during opening hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`mailto:${siteContent.contact.email}`}
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

        {/* Info Box */}
        <div className="mt-8 bg-rsa-navy/50 border border-white/10 rounded-2xl p-6 text-center">
          <p className="text-gray-300 text-sm">
            <span className="font-bold text-rsa-gold">Note:</span> Committee positions are filled by elected members.
            Elections are held annually. All RSA members are welcome to attend Annual General Meetings.
          </p>
        </div>
      </div>
    </div>
  );
}
