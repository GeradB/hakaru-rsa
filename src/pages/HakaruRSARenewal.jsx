import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { getStripe } from '../lib/stripe';

const MEMBERSHIP_FEES = {
  'Returned & Service': 40,
  'Associate (Non-Military)': 40,
  'Youth (Under 18)': 10,
  'Over 80s': 10,
  'Over 90s': 0,
  'Life Member': 0,
};

/** Matches HakaruRSAMembership.jsx input styling */
const inputClass =
  'w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors';

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
      <label className="block text-sm font-bold text-rsa-navy mb-2">
        {label} {required ? <span className="text-red-500">*</span> : null}
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

function StripePaymentInner({ amountNzd, currency, receiptEmail, metadata, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  const handlePay = async () => {
    setPayError("");

    if (!stripe || !elements) {
      setPayError("Stripe has not finished loading yet. Please wait a moment and try again.");
      return;
    }

    setPaying(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setPayError(error.message || "Payment failed.");
        setPaying(false);
        return;
      }

      if (!paymentIntent) {
        setPayError("Unable to confirm payment. Please try again.");
        setPaying(false);
        return;
      }

      if (paymentIntent.status === "succeeded" || paymentIntent.status === "processing") {
        onPaid?.(paymentIntent);
        return;
      }

      setPayError(`Payment status: ${paymentIntent.status}`);
      setPaying(false);
    } catch (e) {
      console.error(e);
      setPayError("Payment failed. Please try again.");
      setPaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />

      {payError ? (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg p-3">{payError}</div>
      ) : null}

      <button
        type="button"
        onClick={handlePay}
        disabled={!stripe || !elements || paying}
        className="w-full bg-rsa-navy text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {paying ? "Processing..." : `Pay $${Number(amountNzd).toFixed(2)} ${currency}`}
      </button>
    </div>
  );
}

function StripePaymentSection({ amountNzd, currency, receiptEmail, metadata, onPaid }) {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";

  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const metadataPayload = useMemo(() => metadata || {}, [metadata]);

  const elementsOptions = useMemo(() => {
    if (!clientSecret) return null;

    return {
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#0f172a",
          borderRadius: "12px",
        },
      },
    };
  }, [clientSecret]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setError("");
      setClientSecret("");
      setLoading(true);

      try {
        const resp = await fetch(`${apiUrl}/api/stripe/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amountNzd,
            currency,
            receiptEmail,
            metadata: metadataPayload,
          }),
        });

        const json = await resp.json();

        if (!resp.ok) {
          throw new Error(json?.error || `Failed to create payment (${resp.status})`);
        }

        if (!json?.clientSecret) {
          throw new Error("Missing client secret from server");
        }

        if (!cancelled) setClientSecret(json.clientSecret);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e?.message || "Could not initialize Stripe payments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (!getStripe()) return;

    const amt = Number(amountNzd);
    if (!Number.isFinite(amt) || amt <= 0) {
      setError("Amount must be greater than $0.00 to pay online.");
      setLoading(false);
      return;
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [apiUrl, amountNzd, currency, receiptEmail, metadataPayload]);

  if (!getStripe()) {
    return (
      <div className="border-2 border-dashed border-rsa-navy/30 bg-rsa-navy/5 p-6 rounded-lg">
        <p className="text-sm font-bold text-rsa-navy">Stripe is not configured</p>
        <p className="text-xs text-gray-600 mt-2">
          Add <code className="bg-white px-1 rounded border border-gray-200">VITE_STRIPE_PUBLISHABLE_KEY</code> to your
          frontend <code className="bg-white px-1 rounded border border-gray-200">.env</code> and restart Vite.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="border-2 border-gray-200 bg-white rounded-lg p-6 text-center text-gray-600">
        Initializing secure card payment...
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-800">
        <p className="font-bold">Could not load Stripe Payment Element</p>
        <p className="mt-2">{error || "Missing paymentIntent client secret."}</p>
        <p className="mt-3 text-xs text-red-900">
          Make sure your backend is running with{" "}
          <code className="bg-white px-1 rounded border border-red-200">STRIPE_SECRET_KEY</code> set and CORS allows{" "}
          <code className="bg-white px-1 rounded border border-red-200">{window.location.origin}</code>.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={getStripe()} options={elementsOptions}>
      <StripePaymentInner amountNzd={amountNzd} currency={currency} receiptEmail={receiptEmail} metadata={metadataPayload} onPaid={onPaid} />
    </Elements>
  );
}

export default function HakaruRSARenewal() {
  const [submitted, setSubmitted] = useState(false);
  const [renewalId, setRenewalId] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [addressResults, setAddressResults] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressResults, setShowAddressResults] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [physicalAddressSearch, setPhysicalAddressSearch] = useState("");
  const [physicalAddressResults, setPhysicalAddressResults] = useState([]);
  const [physicalAddressLoading, setPhysicalAddressLoading] = useState(false);
  const [showPhysicalAddressResults, setShowPhysicalAddressResults] = useState(false);
  const [debouncedPhysicalSearch, setDebouncedPhysicalSearch] = useState("");
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
    membershipType: '',
    donation: '',
  });

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  // NZ Address lookup - proxied through backend to avoid CORS and rate limiting
  const searchAddress = useCallback(async (query) => {
    if (query.length < 3) {
      setAddressResults([]);
      setShowAddressResults(false);
      return;
    }

    setAddressLoading(true);
    try {
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/address/lookup?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setAddressResults(
          data.map((item) => ({
            id: item.place_id,
            fullAddress: item.display_name,
            street:
              item.address?.road ||
              item.address?.pedestrian ||
              item.address?.street ||
              "",
            town: item.address?.town || item.address?.city || item.address?.suburb || "",
            postcode: item.address?.postcode || "",
          }))
        );
        setShowAddressResults(true);
      }
    } catch (error) {
      console.error("Address lookup failed:", error);
      setAddressResults([]);
    } finally {
      setAddressLoading(false);
    }
  }, []);

  const selectAddress = (address) => {
    set("mailingAddress", address.street);
    set("mailingTown", address.town);
    set("mailingPostCode", address.postcode);
    setAddressSearch(address.fullAddress);
    setAddressResults([]);
    setShowAddressResults(false);
  };

  const searchPhysicalAddress = useCallback(async (query) => {
    if (query.length < 3) {
      setPhysicalAddressResults([]);
      setShowPhysicalAddressResults(false);
      return;
    }

    setPhysicalAddressLoading(true);
    try {
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:3001";
      const response = await fetch(`${apiUrl}/api/address/lookup?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (Array.isArray(data)) {
        setPhysicalAddressResults(
          data.map((item) => ({
            id: item.place_id,
            fullAddress: item.display_name,
            street:
              item.address?.road ||
              item.address?.pedestrian ||
              item.address?.street ||
              "",
            town: item.address?.town || item.address?.city || item.address?.suburb || "",
            postcode: item.address?.postcode || "",
          })),
        );
        setShowPhysicalAddressResults(true);
      }
    } catch (error) {
      console.error("Address lookup failed:", error);
      setPhysicalAddressResults([]);
    } finally {
      setPhysicalAddressLoading(false);
    }
  }, []);

  const selectPhysicalAddress = (address) => {
    set("physicalAddress", address.street);
    set("physicalTown", address.town);
    set("physicalPostCode", address.postcode);
    setPhysicalAddressSearch(address.fullAddress);
    setPhysicalAddressResults([]);
    setShowPhysicalAddressResults(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    if (!showAddressResults && !showPhysicalAddressResults) return undefined;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".address-search-container")) {
        setShowAddressResults(false);
      }
      if (!e.target.closest(".physical-address-search-container")) {
        setShowPhysicalAddressResults(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showAddressResults, showPhysicalAddressResults]);

  // Debounce address search to avoid rate limiting
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(addressSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [addressSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPhysicalSearch(physicalAddressSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [physicalAddressSearch]);

  useEffect(() => {
    if (debouncedSearch) {
      searchAddress(debouncedSearch);
    } else {
      setAddressResults([]);
      setShowAddressResults(false);
    }
  }, [debouncedSearch, searchAddress]);

  useEffect(() => {
    if (debouncedPhysicalSearch) {
      searchPhysicalAddress(debouncedPhysicalSearch);
    } else {
      setPhysicalAddressResults([]);
      setShowPhysicalAddressResults(false);
    }
  }, [debouncedPhysicalSearch, searchPhysicalAddress]);

  const fee = MEMBERSHIP_FEES[form.membershipType] ?? 0;
  const donationAmount = Number.isFinite(Number(form.donation)) ? Number(form.donation) : 0;
  const total = useMemo(() => fee + (donationAmount > 0 ? donationAmount : 0), [fee, donationAmount]);

  const canSubmit =
    form.fullName.trim() &&
    form.email.trim() &&
    form.membershipType;

  const stripeMetadata = useMemo(() => {
    return {
      flow: "membership_renewal",
      membership_type: form.membershipType || "",
      applicant_email: form.email || "",
    };
  }, [form.membershipType, form.email]);

  const handleStripePaid = useCallback(async (paymentIntent) => {
    const apiUrl =
      import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:3001";

    try {
      // Submit renewal data to database
      const response = await fetch(`${apiUrl}/api/renewal/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: form, fee, donation: donationAmount, total }),
      });

      const data = await response.json();

      if (data.success) {
        setRenewalId(data.renewalId);

        // Update payment information and write all fields to database
        await fetch(`${apiUrl}/api/renewal/update-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            renewalId: data.renewalId,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            amount: total,
            formData: form,
            fee,
            donation: donationAmount,
          }),
        });
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting renewal:", error);
      setSubmitted(true);
    }
  }, [form, fee, donationAmount, total]);

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
              Thanks, <span className="font-bold text-rsa-navy">{form.fullName}</span>. We've received your renewal request.
            </p>
            {renewalId && (
              <div className="bg-rsa-navy/5 border border-rsa-navy/20 rounded-lg p-3 mb-6">
                <p className="text-sm font-bold text-rsa-navy">Renewal Reference</p>
                <p className="text-lg font-mono text-rsa-navy">{renewalId}</p>
              </div>
            )}
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
                className={inputClass}
                placeholder="John Smith"
                required
              />
            </Field>

            <Field label="Membership number">
              <input
                type="text"
                value={form.membershipNumber}
                onChange={(e) => set('membershipNumber', e.target.value)}
                className={inputClass}
                placeholder="Optional"
              />
            </Field>

            <Field label="Date of birth">
              <input
                type="date"
                value={form.dob}
                onChange={(e) => set('dob', e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Email address" required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className={inputClass}
                placeholder="your@email.com"
                required
              />
            </Field>

            <Field label="Home phone">
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={form.homePhone}
                onChange={(e) => set('homePhone', e.target.value)}
                className={inputClass}
                placeholder="09 xxx xxxx"
              />
            </Field>

            <Field label="Mobile">
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={form.mobile}
                onChange={(e) => set('mobile', e.target.value)}
                className={inputClass}
                placeholder="021 xxx xxxx"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Addresses">
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-bold text-rsa-navy mb-4">Mailing address</h3>
              <div className="space-y-4">
                <div className="address-search-container">
                  <Field label="Search address">
                    <div className="relative">
                      <input
                        type="text"
                        value={addressSearch}
                        onChange={(e) => setAddressSearch(e.target.value)}
                        onFocus={() => addressResults.length > 0 && setShowAddressResults(true)}
                        placeholder="Start typing address to search..."
                        className={inputClass}
                      />
                      {addressLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-rsa-navy border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {showAddressResults && addressResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-rsa-navy/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {addressResults.map((addr) => (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => selectAddress(addr)}
                              className="w-full px-4 py-3 text-left text-sm hover:bg-rsa-gold/10 border-b border-gray-100 last:border-0 transition-colors"
                            >
                              <div className="font-bold text-rsa-navy">{addr.fullAddress}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Search by street name, town, or postcode</p>
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Street address">
                    <input
                      type="text"
                      value={form.mailingAddress}
                      onChange={(e) => set('mailingAddress', e.target.value)}
                      className={inputClass}
                      placeholder="Or enter manually"
                    />
                  </Field>
                  <Field label="Town">
                    <input
                      type="text"
                      value={form.mailingTown}
                      onChange={(e) => set('mailingTown', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Post code">
                    <input
                      type="text"
                      value={form.mailingPostCode}
                      onChange={(e) => set('mailingPostCode', e.target.value)}
                      className={inputClass}
                      placeholder="0000"
                    />
                  </Field>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-rsa-navy mb-2">Physical address</h3>
              <p className="text-sm text-gray-600 mb-4">If different from your mailing address.</p>
              <div className="space-y-4">
                <div className="physical-address-search-container">
                  <Field label="Search address">
                    <div className="relative">
                      <input
                        type="text"
                        value={physicalAddressSearch}
                        onChange={(e) => setPhysicalAddressSearch(e.target.value)}
                        onFocus={() => physicalAddressResults.length > 0 && setShowPhysicalAddressResults(true)}
                        placeholder="Start typing address to search..."
                        className={inputClass}
                      />
                      {physicalAddressLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-rsa-navy border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {showPhysicalAddressResults && physicalAddressResults.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border-2 border-rsa-navy/30 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {physicalAddressResults.map((addr) => (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => selectPhysicalAddress(addr)}
                              className="w-full px-4 py-3 text-left text-sm hover:bg-rsa-gold/10 border-b border-gray-100 last:border-0 transition-colors"
                            >
                              <div className="font-bold text-rsa-navy">{addr.fullAddress}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Search by street name, town, or postcode</p>
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Field label="Street address">
                    <input
                      type="text"
                      value={form.physicalAddress}
                      onChange={(e) => set('physicalAddress', e.target.value)}
                      className={inputClass}
                      placeholder="Or enter manually"
                    />
                  </Field>
                  <Field label="Town">
                    <input
                      type="text"
                      value={form.physicalTown}
                      onChange={(e) => set('physicalTown', e.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Post code">
                    <input
                      type="text"
                      value={form.physicalPostCode}
                      onChange={(e) => set('physicalPostCode', e.target.value)}
                      className={inputClass}
                      placeholder="0000"
                    />
                  </Field>
                </div>
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
                    className={inputClass}
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

            {total > 0 ? (
              <div>
                <p className="text-lg font-bold text-rsa-navy mb-4">Card Payment</p>
                <div className="border-2 border-gray-200 bg-white rounded-lg p-6">
                  <StripePaymentSection
                    amountNzd={total}
                    currency={import.meta.env.VITE_CURRENCY || "NZD"}
                    receiptEmail={form.email}
                    metadata={stripeMetadata}
                    onPaid={handleStripePaid}
                  />
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleStripePaid({ id: 'no-payment-required', status: 'succeeded' })}
                disabled={!canSubmit}
                className="w-full bg-rsa-navy text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all focus:ring-4 focus:ring-rsa-navy/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Renewal (No Payment Required)
              </button>
            )}

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
