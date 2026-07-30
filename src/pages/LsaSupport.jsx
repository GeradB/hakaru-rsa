import { Link } from 'react-router-dom';

const HELP_ITEMS = [
  {
    title: "Veterans' Affairs Applications",
    body: (
      <>
        Assistance with completing applications, requesting medical reassessments, and filing claims
        through{' '}
        <a
          href="https://www.veteransaffairs.mil.nz/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-rsa-navy font-semibold underline decoration-rsa-gold/60 underline-offset-2 hover:text-rsa-gold"
        >
          Veterans&apos; Affairs New Zealand
        </a>
        .
      </>
    ),
  },
  {
    title: 'Financial Assistance & Grants',
    body: 'Support with accessing emergency financial funds or standard welfare grants for medical costs, mobility assistance, or home maintenance.',
  },
  {
    title: 'Health & Well-being Support',
    body: "Connections to regional healthcare, veterans' counseling services, and localized rehabilitation support.",
  },
  {
    title: 'Home Visits & Welfare Checks',
    body: 'For veterans or dependents residing in the local Hakaru, Kaiwaka, and Mangawhai areas who are unable to travel to the clubrooms.',
  },
];

const ADDRESS = 'Hakaru & Districts Memorial RSA, 733 Settlement Road, Hakaru, NZ';
const MAPS_URL = `https://maps.google.com/?q=${encodeURIComponent('733 Settlement Road, Hakaru, New Zealand')}`;

export default function LsaSupport() {
  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 text-center leading-tight">
          Veterans&apos; Support &amp; Local Support Advisor (LSA) Services
        </h1>
        <p className="text-lg md:text-xl text-gray-300 text-center mb-12 max-w-3xl mx-auto leading-relaxed">
          The Hakaru &amp; Districts Memorial RSA is dedicated to ensuring that veterans, active
          service members, and their families receive comprehensive health, pension, and welfare
          support.
        </p>

        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
          <h2 className="text-2xl font-bold font-heading text-rsa-navy mb-4">
            Veteran Support Services (LSA)
          </h2>
          <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
            <p>
              If you are a serving or ex-serving military person, a member of the NZ Police, or a
              family dependent, our Local Support Advisor (LSA) is here to help you navigate your
              entitlements. You do not need to be a financial member of the RSA to access our support
              network.
            </p>
            <p>
              Our LSA offers strictly confidential, one-on-one guidance to connect you with
              financial, medical, and emotional assistance.
            </p>
          </div>

          <hr className="border-rsa-navy/15 my-8" />

          <h3 className="text-xl font-bold font-heading text-rsa-navy mb-5">
            How Our Local Support Advisor Can Help
          </h3>
          <ul className="space-y-5">
            {HELP_ITEMS.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span
                  className="mt-2 w-2 h-2 rounded-full bg-rsa-gold flex-shrink-0"
                  aria-hidden="true"
                />
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-bold text-rsa-navy">{item.title}:</span> {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-rsa-navy border border-white/10 rounded-2xl shadow-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-rsa-gold mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-200 leading-relaxed mb-8 max-w-2xl">
            To book a confidential appointment or a home visit, contact our Local Support Advisor
            directly or drop into the clubrooms during standard operating hours.
          </p>

          <ul className="space-y-5 text-white">
            <li className="flex flex-col sm:flex-row sm:gap-2 border-b border-white/10 pb-4">
              <span className="font-bold text-rsa-gold shrink-0 sm:min-w-[11rem]">
                Local Support Advisor:
              </span>
              <span>William Warren</span>
            </li>
            <li className="flex flex-col sm:flex-row sm:gap-2 border-b border-white/10 pb-4">
              <span className="font-bold text-rsa-gold shrink-0 sm:min-w-[11rem]">
                Physical Address:
              </span>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-200 hover:text-rsa-gold underline decoration-white/30 underline-offset-2 transition-colors"
              >
                {ADDRESS}
              </a>
            </li>
            <li className="flex flex-col sm:flex-row sm:gap-2 border-b border-white/10 pb-4">
              <span className="font-bold text-rsa-gold shrink-0 sm:min-w-[11rem]">
                Direct Mobile:
              </span>
              <a
                href="tel:02102545955"
                className="text-gray-200 hover:text-rsa-gold underline decoration-white/30 underline-offset-2 transition-colors"
              >
                021 025 45955
              </a>
            </li>
            <li className="flex flex-col sm:flex-row sm:gap-2 border-b border-white/10 pb-4">
              <span className="font-bold text-rsa-gold shrink-0 sm:min-w-[11rem]">
                General Enquiries:
              </span>
              <span className="text-gray-200">
                <a
                  href="mailto:LSA@hakarursa.co.nz"
                  className="hover:text-rsa-gold underline decoration-white/30 underline-offset-2 transition-colors"
                >
                  LSA@hakarursa.co.nz
                </a>
                {' or '}
                <a
                  href="mailto:president@hakarursa.co.nz"
                  className="hover:text-rsa-gold underline decoration-white/30 underline-offset-2 transition-colors"
                >
                  president@hakarursa.co.nz
                </a>
              </span>
            </li>
            <li className="flex flex-col sm:flex-row sm:gap-2">
              <span className="font-bold text-rsa-gold shrink-0 sm:min-w-[11rem]">
                Official Website:
              </span>
              <Link
                to="/"
                className="text-gray-200 hover:text-rsa-gold underline decoration-white/30 underline-offset-2 transition-colors"
              >
                Hakaru RSA Official Portal
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
