import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const MEMBERSHIP_FEES = {
  'Returned & Service': 40,
  'Associate (Non-Military)': 40,
  'Youth (Under 18)': 10,
  'Over 80s': 10,
  'Over 90s': 0,
  'Life Member': 0,
};

function FormSection({ title, children }) {
  return (
    <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8">
      <h2 className="text-2xl font-bold font-heading text-rsa-navy mb-6">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-gray-700 font-bold mb-2">
        {label} {required ? <span className="text-rsa-gold">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function YesNoToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-lg overflow-hidden border-2 border-rsa-navy/20">
      {['Yes', 'No'].map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={[
              'px-4 py-2 text-sm font-bold transition-colors',
              active ? 'bg-rsa-navy text-white' : 'bg-white text-rsa-navy hover:bg-rsa-navy/5',
            ].join(' ')}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default function HakaruRSARenewal() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    membershipNumber: '',
    dob: '',
    mailingAddress: '',
    mailingTown: '',
    mailingPostCode: '',
    physicalAddress: '',
    physicalTown: '',
    physicalPostCode: '',
    homePhone: '',
    mobile: '',
    email: '',
    consentEmail: '',
    consentAGM: '',
    consentWomens: '',
    membershipType: '',
    donation: '',
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const fee = MEMBERSHIP_FEES[form.membershipType] ?? 0;
  const donationAmount = Number.isFinite(Number(form.donation)) ? Number(form.donation) : 0;
  const total = useMemo(() => fee + (donationAmount > 0 ? donationAmount : 0), [fee, donationAmount]);

  const canSubmit =
    form.fullName.trim() &&
    form.email.trim() &&
    form.membershipType &&
    // keep this light—renewals often have incomplete address info
    true;

  if (submitted) {
    return (
      <div className="bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen py-16">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold font-heading text-rsa-navy mb-4">Renewal Submitted</h1>
            <p className="text-gray-600 mb-6">
              Thanks, <span className="font-bold text-rsa-navy">{form.fullName}</span>. We’ve received your renewal request.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-green-900 text-sm">
                <strong>Email:</strong> {form.email}
              </p>
              <p className="text-green-900 text-sm mt-2">
                <strong>Membership type:</strong> {form.membershipType}
              </p>
              <p className="text-green-900 text-sm mt-2">
                <strong>Total due:</strong> ${total.toFixed(2)} NZD
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                to="/membership"
                className="inline-block bg-rsa-gold text-rsa-navy px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
              >
                Back to Membership
              </Link>
              <Link
                to="/contact"
                className="inline-block bg-rsa-navy text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold font-heading text-white mb-4">Membership Renewal</h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Renew your Hakaru &amp; Districts RSA membership. If you have updated details, please include them below.
          </p>
        </div>

        <FormSection title="Member Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Full name" required>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                placeholder="John Smith"
                required
              />
            </Field>

            <Field label="Membership number">
              <input
                type="text"
                value={form.membershipNumber}
                onChange={(e) => set('membershipNumber', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                placeholder="Optional"
              />
            </Field>

            <Field label="Date of birth">
              <input
                type="date"
                value={form.dob}
                onChange={(e) => set('dob', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
              />
            </Field>

            <Field label="Email address" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                placeholder="your@email.com"
                required
              />
            </Field>

            <Field label="Home phone">
              <input
                type="tel"
                value={form.homePhone}
                onChange={(e) => set('homePhone', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                placeholder="09 431 2345"
              />
            </Field>

            <Field label="Mobile">
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                placeholder="021 123 4567"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Addresses">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-rsa-navy mb-4">Mailing address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Street address">
                  <input
                    type="text"
                    value={form.mailingAddress}
                    onChange={(e) => set('mailingAddress', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                  />
                </Field>
                <Field label="Town">
                  <input
                    type="text"
                    value={form.mailingTown}
                    onChange={(e) => set('mailingTown', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                  />
                </Field>
                <Field label="Post code">
                  <input
                    type="text"
                    value={form.mailingPostCode}
                    onChange={(e) => set('mailingPostCode', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                    placeholder="0000"
                  />
                </Field>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-rsa-navy mb-2">Physical address</h3>
              <p className="text-sm text-gray-600 mb-4">If different from your mailing address.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Street address">
                  <input
                    type="text"
                    value={form.physicalAddress}
                    onChange={(e) => set('physicalAddress', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                  />
                </Field>
                <Field label="Town">
                  <input
                    type="text"
                    value={form.physicalTown}
                    onChange={(e) => set('physicalTown', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                  />
                </Field>
                <Field label="Post code">
                  <input
                    type="text"
                    value={form.physicalPostCode}
                    onChange={(e) => set('physicalPostCode', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                    placeholder="0000"
                  />
                </Field>
              </div>
            </div>
          </div>
        </FormSection>

        <FormSection title="Consents">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-6 border-2 border-rsa-navy/10 rounded-lg p-4">
              <div>
                <p className="font-bold text-rsa-navy">RSA events</p>
                <p className="text-sm text-gray-600">I consent to be contacted via email for RSA related events.</p>
              </div>
              <YesNoToggle value={form.consentEmail} onChange={(v) => set('consentEmail', v)} />
            </div>
            <div className="flex items-start justify-between gap-6 border-2 border-rsa-navy/10 rounded-lg p-4">
              <div>
                <p className="font-bold text-rsa-navy">AGMs &amp; EGMs</p>
                <p className="text-sm text-gray-600">I consent to be contacted via email for Hakaru RSA AGMs &amp; EGMs.</p>
              </div>
              <YesNoToggle value={form.consentAGM} onChange={(v) => set('consentAGM', v)} />
            </div>
            <div className="flex items-start justify-between gap-6 border-2 border-rsa-navy/10 rounded-lg p-4">
              <div>
                <p className="font-bold text-rsa-navy">Women’s section</p>
                <p className="text-sm text-gray-600">
                  Ladies, I consent to my contact details to be passed to the Hakaru RSA Women&apos;s section.
                </p>
              </div>
              <YesNoToggle value={form.consentWomens} onChange={(v) => set('consentWomens', v)} />
            </div>
          </div>
        </FormSection>

        <FormSection title="Membership type & payment">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(MEMBERSHIP_FEES).map(([type, amount]) => {
                const selected = form.membershipType === type;
                return (
                  <label
                    key={type}
                    className={[
                      'flex items-center justify-between gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors',
                      selected ? 'border-rsa-gold bg-rsa-gold/10' : 'border-gray-200 bg-white hover:border-rsa-navy/30',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          selected ? 'border-rsa-gold bg-rsa-gold' : 'border-rsa-navy/30 bg-white',
                        ].join(' ')}
                        aria-hidden="true"
                      >
                        {selected ? <span className="w-2 h-2 bg-rsa-navy rounded-full" /> : null}
                      </span>
                      <span className="font-bold text-rsa-navy">{type}</span>
                    </div>
                    <span className="font-bold text-rsa-navy">
                      {amount === 0 ? 'Free' : `$${amount.toFixed(2)}`}
                    </span>
                    <input
                      type="radio"
                      className="sr-only"
                      checked={selected}
                      onChange={() => set('membershipType', type)}
                    />
                  </label>
                );
              })}
            </div>

            <div className="bg-rsa-navy/5 border-2 border-rsa-navy/10 rounded-lg p-4">
              <Field label="Additional donation (optional)">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rsa-navy">$</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={form.donation}
                    onChange={(e) => set('donation', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </Field>
              <p className="text-sm text-gray-600 mt-2">Donations are always appreciated.</p>
            </div>

            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <span className="text-gray-700 font-bold">Renewal fee</span>
                <span className="text-rsa-navy font-bold">${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <span className="text-gray-700 font-bold">Donation</span>
                <span className="text-rsa-navy font-bold">${(donationAmount > 0 ? donationAmount : 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-rsa-gold/10">
                <span className="text-rsa-navy font-bold text-lg">Total due</span>
                <span className="text-rsa-navy font-black text-2xl">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-rsa-navy/5 border-2 border-rsa-navy/10 rounded-lg p-4 text-sm text-gray-700">
              By submitting this renewal I confirm that all information provided is correct and up to date.
            </div>

            <button
              type="button"
              onClick={() => setSubmitted(true)}
              disabled={!canSubmit}
              className="w-full bg-rsa-navy text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all focus:ring-4 focus:ring-rsa-navy/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Renewal
            </button>

            <div className="text-center">
              <Link to="/membership" className="inline-flex items-center text-rsa-navy hover:text-rsa-gold transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Membership
              </Link>
            </div>
          </div>
        </FormSection>
      </div>
    </div>
  );
}

