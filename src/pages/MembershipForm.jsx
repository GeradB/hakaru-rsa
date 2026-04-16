import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function MembershipForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phone: '',
    email: '',
    signature: '',
    date: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Membership form submitted! (This is a demo - connect to your backend)');
  };

  return (
    <div className="bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4 text-center">
          Provisional Membership Form
        </h1>
        <p className="text-lg text-gray-300 text-center mb-12">
          Hakaru & Districts RSA
        </p>

        {/* Info Box */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 mb-8">
          <div className="bg-rsa-gold/20 border-l-4 border-rsa-gold p-4 mb-6">
            <p className="text-gray-700">
              The bearer of the detached Provisional Membership Card is entitled to Membership to the RSA and is effective from the date detailed below.
              Provisional Membership can only be applied for <strong>'ONCE'</strong> per annum and Provisional Members will be invited to continue their Membership after 30 days.
            </p>
          </div>

          <div className="bg-rsa-navy text-white p-6 rounded-lg mb-6">
            <p className="text-lg font-bold text-center mb-2">
              Your Provisional Membership number is
            </p>
            <div className="bg-white/10 h-12 rounded flex items-center justify-center">
              <span className="text-3xl font-mono text-rsa-gold">_______________</span>
            </div>
          </div>

          <h2 className="text-xl font-bold font-heading text-rsa-navy mb-4">
            Mode of Admission as a Provisional Member of the RSA
          </h2>

          <div className="space-y-4 text-gray-700">
            <div>
              <p className="font-bold text-rsa-navy">1. In all cases it shall be a prerequisite that the person, at the time of making application for membership</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>Be eligible for admission under one of the other categories of membership, and</li>
                <li>Have attained the age of 18 years or the minimum age for the purchase and consumption of alcohol as specified in the Sale and Supply of Alcohol Act 2012 or any amendments or re-enactments thereof, and</li>
                <li>Expressly agree in writing to comply with the Local Association's rules.</li>
              </ul>
            </div>

            <p className="font-bold text-rsa-navy">2. In all cases, it shall be the responsibility of the person concerned to produce satisfactory evidence of eligibility for Provisional Membership.</p>

            <div>
              <p className="font-bold text-rsa-navy">3. Subject to the exceptions detailed below, Provisional Membership is granted on the following conditions:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>A Provisional Membership may be revoked at any time by the Executive Committee if the prerequisites for membership are found not to have been satisfied, and</li>
                <li>Provisional Membership is granted on the following conditions:
                  <ul className="list-circle list-inside ml-4 mt-2 space-y-1">
                    <li>There will be no subscription or fee for the period of the Provisional Membership,</li>
                    <li>A membership card will be provided marked 'Provisional' for the period of the Provisional Membership, so that the Provisional Member can be clearly identified as a bona fide member of the local Association,</li>
                    <li>The one month Provisional Membership period cannot be extended,</li>
                    <li>On the expiration of one month from admission, the Provisional Membership will lapse, and the Provisional Member may be invited to apply for membership (under the appropriate mode or form),</li>
                    <li>A Provisional Member may invite guests to the Local Association's Club premises,</li>
                    <li>A Provisional Member is not eligible to nominate and/or second applicants for any class of membership,</li>
                    <li>A Provisional Member shall have the right to attend but not speak or vote at General Meetings, and</li>
                    <li>Subject to the foregoing, the Provisional Member may access the facilities of, and enjoy the privileges of membership of the local Association.</li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold font-heading text-rsa-navy mb-6">Application Details</h2>

          <div className="space-y-6">
            {/* Signature */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Signature <span className="text-rsa-gold">*</span>
              </label>
              <input
                type="text"
                name="signature"
                value={formData.signature}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                placeholder="Sign here"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Date <span className="text-rsa-gold">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Please print your full name here <span className="text-rsa-gold">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                placeholder="John Smith"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Address <span className="text-rsa-gold">*</span>
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors resize-none"
                placeholder="123 Example Street, Town, Postcode"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Phone <span className="text-rsa-gold">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                placeholder="09 431 2345"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Email Address <span className="text-rsa-gold">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                placeholder="your@email.com"
              />
            </div>

            {/* Declaration */}
            <div className="bg-rsa-navy/5 border-2 border-rsa-navy/20 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                <span className="font-bold">Declaration:</span> This card must be shown on request when ordering alcoholic drinks.
                Provisional Members must adhere to the Rules as set by the Executive of the Club.
                Please read this form carefully before signing.
              </p>
              <p className="text-gray-700 text-sm mt-2 font-bold">
                I declare I am over the age of 18 and if required will show identification of which I have recorded.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-rsa-gold text-rsa-navy px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-all hover:scale-105 focus:ring-4 focus:ring-rsa-gold/50"
            >
              Submit Application
            </button>
          </div>
        </form>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/membership"
            className="inline-flex items-center text-white hover:text-rsa-gold transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Membership Info
          </Link>
        </div>
      </div>
    </div>
  );
}
