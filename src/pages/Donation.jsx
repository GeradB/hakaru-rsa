import { useState, useEffect, useCallback } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { apiUrl, fetchApiJson } from '../apiBase';
import { getStripe } from '../lib/stripe';
import { useSiteContent } from '../context/SiteContentContext';

const PRESET_AMOUNTS = [20, 50, 100];
const INTERVALS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: '3-monthly', label: '3 Monthly' },
  { value: '6-monthly', label: '6 Monthly' },
  { value: 'annually', label: 'Annually' },
];

/** Match HakaruRSAMembership / HakaruRSARenewal donor fields */
const donorFieldLabelClass = 'block text-sm font-bold text-rsa-navy mb-2';
const donorInputClass =
  'w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white focus:border-rsa-gold focus:ring-2 focus:ring-rsa-gold/20 outline-none transition-colors';

function StripePaymentInner({ amount, timing, interval, donorType, isAnonymous, donorData, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isElementReady, setIsElementReady] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements || !isElementReady) {
      setError('Payment form is not ready. Please wait a moment and try again.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // First, submit donation data to get a donation ID
      const submitResult = await fetchApiJson('/api/donation/submit', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          formData: {
            amount,
            timing,
            interval: timing === 'recurring' ? interval : null,
            donorType,
            isAnonymous,
            ...donorData,
          },
        }),
      });

      if (!submitResult.success) {
        throw new Error(submitResult.error || 'Failed to submit donation');
      }

      const donationId = submitResult.donationId;

      // Create payment intent
      const paymentResult = await fetchApiJson('/api/stripe/create-payment-intent', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          amountNzd: amount,
          currency: 'NZD',
          receiptEmail: isAnonymous ? null : donorData.email,
          metadata: { donationId, type: 'donation' },
        }),
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Failed to create payment');
      }

      // Confirm payment with Stripe
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donate/success`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment failed');
      }

      // Update donation with payment info
      await fetchApiJson('/api/donation/update-payment', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          donationId,
          paymentIntentId: paymentResult.paymentIntentId,
          status: 'succeeded',
          amount,
          formData: {
            amount,
            timing,
            interval: timing === 'recurring' ? interval : null,
            donorType,
            isAnonymous,
            ...donorData,
          },
        }),
      });

      onSuccess({ donationId, paymentIntentId: paymentResult.paymentIntentId });
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        onReady={() => setIsElementReady(true)}
        onChange={(e) => {
          if (e.error) {
            setError(e.error.message);
          } else {
            setError(null);
          }
        }}
        options={{
          layout: 'tabs',
        }}
      />
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || !isElementReady || isProcessing}
        className="w-full bg-rsa-navy text-white py-3 px-4 rounded-md font-semibold hover:bg-rsa-navy/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? 'Processing...' : `Donate $${amount}`}
      </button>
    </form>
  );
}

function StripePaymentSection({ amount, timing, interval, donorType, isAnonymous, donorData, onSuccess }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const fetchClientSecret = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const result = await fetchApiJson('/api/stripe/create-payment-intent', {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          amountNzd: amount,
          currency: 'NZD',
          receiptEmail: isAnonymous ? null : donorData.email,
          metadata: { type: 'donation' },
        }),
      });

      if (result.success) {
        setClientSecret(result.clientSecret);
      } else {
        setLoadError(result.error || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Error fetching client secret:', error);
      setLoadError('Unable to connect to payment server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {!clientSecret ? (
        <button
          type="button"
          onClick={fetchClientSecret}
          disabled={isLoading}
          className="w-full bg-rsa-gold text-rsa-navy py-3 px-4 rounded-md font-semibold hover:bg-rsa-gold/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Loading...' : 'Proceed to Payment'}
        </button>
      ) : (
        <>
          {loadError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {loadError}
              <button
                onClick={fetchClientSecret}
                className="ml-2 underline font-semibold"
              >
                Try again
              </button>
            </div>
          )}
          <Elements
            stripe={getStripe()}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#1a365d',
                },
              },
            }}
          >
            <StripePaymentInner
              amount={amount}
              timing={timing}
              interval={interval}
              donorType={donorType}
              isAnonymous={isAnonymous}
              donorData={donorData}
              onSuccess={onSuccess}
            />
          </Elements>
        </>
      )}
    </div>
  );
}

export default function Donation() {
  const siteContent = useSiteContent();
  const donatePage = siteContent.donatePage || {};

  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [timing, setTiming] = useState('one-off');
  const [interval, setInterval] = useState('monthly');
  const [donorType, setDonorType] = useState('me');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorData, setDonorData] = useState({
    fullName: '',
    organisationName: '',
    email: '',
    homePhone: '',
    mobile: '',
    mailingAddress: '',
    mailingTown: '',
    mailingPostCode: '',
  });
  const [showPayment, setShowPayment] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [addressSearch, setAddressSearch] = useState('');
  const [addressResults, setAddressResults] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressResults, setShowAddressResults] = useState(false);
  const [debouncedAddressSearch, setDebouncedAddressSearch] = useState('');

  const handlePresetAmount = (preset) => {
    setAmount(preset);
    setCustomAmount('');
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setCustomAmount(value);
    if (value) {
      setAmount(parseFloat(value) || 0);
    } else {
      setAmount(0);
    }
  };

  const handleDonorDataChange = (e) => {
    const { name, value } = e.target;
    setDonorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSuccess = () => {
    setDonationSuccess(true);
    window.scrollTo(0, 0);
  };

  const searchAddresses = useCallback(async (query) => {
    if (query.length < 3) {
      setAddressResults([]);
      setShowAddressResults(false);
      return;
    }
    setAddressLoading(true);
    try {
      const response = await fetch(apiUrl(`/api/address/lookup?q=${encodeURIComponent(query)}`));
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
              '',
            town: item.address?.town || item.address?.city || item.address?.suburb || '',
            postcode: item.address?.postcode || '',
          })),
        );
        setShowAddressResults(true);
      }
    } catch (e) {
      console.error('Address lookup failed:', e);
      setAddressResults([]);
    } finally {
      setAddressLoading(false);
    }
  }, []);

  const selectMailingFromLookup = (addr) => {
    setDonorData((prev) => ({
      ...prev,
      mailingAddress: addr.street,
      mailingTown: addr.town,
      mailingPostCode: addr.postcode,
    }));
    setAddressSearch(addr.fullAddress);
    setAddressResults([]);
    setShowAddressResults(false);
  };

  useEffect(() => {
    if (!showAddressResults) return undefined;
    const close = (e) => {
      if (!e.target.closest('.donation-address-search')) {
        setShowAddressResults(false);
      }
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showAddressResults]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedAddressSearch(addressSearch), 500);
    return () => clearTimeout(t);
  }, [addressSearch]);

  useEffect(() => {
    if (debouncedAddressSearch) {
      searchAddresses(debouncedAddressSearch);
    } else {
      setAddressResults([]);
      setShowAddressResults(false);
    }
  }, [debouncedAddressSearch, searchAddresses]);

  // Check for success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_intent_client_secret')) {
      // Payment completed via redirect
      setDonationSuccess(true);
      window.history.replaceState({}, document.title, '/donate');
    }
  }, []);

  if (donationSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            {donatePage.successTitle || 'Thank You for Your Donation!'}
          </h2>
          <p className="text-green-700 mb-6">
            {donatePage.successBody ||
              'Your generous donation has been received. A confirmation email will be sent shortly.'}
          </p>
          <p className="text-green-600 text-sm">
            {donatePage.successFootnote || 'Transaction reference has been recorded.'}
          </p>
          <a
            href="/donate"
            className="inline-block mt-4 text-rsa-navy underline font-semibold"
          >
            Make another donation
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-rsa-navy mb-2">
        {donatePage.title || 'Make a Donation'}
      </h1>
      <p className="text-gray-600 mb-8">
        {donatePage.intro ||
          'Support Hakaru & Districts RSA with a donation. Your contribution helps us continue our mission.'}
      </p>
      {donatePage.imageUrl?.trim?.() ? (
        <img
          src={donatePage.imageUrl.trim()}
          alt=""
          className="mb-8 w-full max-h-56 rounded-lg object-cover shadow-md"
        />
      ) : null}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-rsa-navy mb-4">Donation Amount</h2>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetAmount(preset)}
              className={`py-3 px-4 rounded-md font-semibold transition-colors ${
                amount === preset
                  ? 'bg-rsa-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ${preset}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or enter custom amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="text"
              inputMode="decimal"
              value={customAmount}
              onChange={handleCustomAmount}
              onFocus={() => setAmount(parseFloat(customAmount) || 0)}
              className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rsa-navy focus:border-transparent"
              placeholder="Enter amount"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Donation Timing
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="timing"
                value="one-off"
                checked={timing === 'one-off'}
                onChange={(e) => setTiming(e.target.value)}
                className="mr-2"
              />
              <span>One-off</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="timing"
                value="recurring"
                checked={timing === 'recurring'}
                onChange={(e) => setTiming(e.target.value)}
                className="mr-2"
              />
              <span>Recurring</span>
            </label>
          </div>
        </div>

        {timing === 'recurring' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interval
            </label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-rsa-navy focus:border-transparent"
            >
              {INTERVALS.map((int) => (
                <option key={int.value} value={int.value}>
                  {int.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Donating as
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="donorType"
                value="me"
                checked={donorType === 'me'}
                onChange={(e) => setDonorType(e.target.value)}
                className="mr-2"
              />
              <span>Me</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="donorType"
                value="organisation"
                checked={donorType === 'organisation'}
                onChange={(e) => setDonorType(e.target.value)}
                className="mr-2"
              />
              <span>Organisation</span>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              Make this donation anonymously (no tax receipt will be sent)
            </span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold font-heading text-rsa-navy mb-4">
          {donorType === 'me' ? 'Your Details' : 'Organisation Details'}
        </h2>

        {donorType === 'me' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className={donorFieldLabelClass}>
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={donorData.fullName}
                onChange={handleDonorDataChange}
                className={donorInputClass}
                placeholder="John Smith"
                required
              />
            </div>
            <div>
              <label className={donorFieldLabelClass}>
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                value={donorData.email}
                onChange={handleDonorDataChange}
                className={donorInputClass}
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label className={donorFieldLabelClass}>
              Organisation name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="organisationName"
              value={donorData.organisationName}
              onChange={handleDonorDataChange}
              className={donorInputClass}
              required
            />
          </div>
        )}

        <div
          className={`grid grid-cols-1 gap-6 mb-4 ${
            !isAnonymous && donorType === 'organisation' ? 'md:grid-cols-3' : 'md:grid-cols-2'
          }`}
        >
          <div>
            <label className={donorFieldLabelClass}>Phone</label>
            <input
              type="tel"
              name="homePhone"
              inputMode="tel"
              autoComplete="tel-national"
              value={donorData.homePhone}
              onChange={handleDonorDataChange}
              className={donorInputClass}
              placeholder="09 xxx xxxx"
            />
          </div>
          <div>
            <label className={donorFieldLabelClass}>Mobile</label>
            <input
              type="tel"
              name="mobile"
              inputMode="tel"
              autoComplete="tel-national"
              value={donorData.mobile}
              onChange={handleDonorDataChange}
              className={donorInputClass}
              placeholder="021 xxx xxxx"
            />
          </div>
          {/* Email for "Organisation" only — "Me" already has Email in the row above */}
          {!isAnonymous && donorType === 'organisation' && (
            <div>
              <label className={donorFieldLabelClass}>
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                inputMode="email"
                autoComplete="email"
                value={donorData.email}
                onChange={handleDonorDataChange}
                className={donorInputClass}
                placeholder="your@email.com"
                required
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <p className="text-lg font-bold text-rsa-navy">Mailing address</p>
          <div className="donation-address-search">
            <label className={donorFieldLabelClass}>Search address</label>
            <div className="relative">
              <input
                type="text"
                value={addressSearch}
                onChange={(e) => setAddressSearch(e.target.value)}
                onFocus={() => addressResults.length > 0 && setShowAddressResults(true)}
                placeholder="Start typing address to search..."
                className={donorInputClass}
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
                      onClick={() => selectMailingFromLookup(addr)}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-rsa-gold/10 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <div className="font-bold text-rsa-navy">{addr.fullAddress}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Search by street name, town, or postcode</p>
          </div>
          <div>
            <label className={donorFieldLabelClass}>Street address</label>
            <input
              type="text"
              name="mailingAddress"
              value={donorData.mailingAddress}
              onChange={handleDonorDataChange}
              className={donorInputClass}
              placeholder="Or enter manually"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={donorFieldLabelClass}>Town</label>
              <input
                type="text"
                name="mailingTown"
                value={donorData.mailingTown}
                onChange={handleDonorDataChange}
                className={donorInputClass}
              />
            </div>
            <div>
              <label className={donorFieldLabelClass}>Post code</label>
              <input
                type="text"
                name="mailingPostCode"
                value={donorData.mailingPostCode}
                onChange={handleDonorDataChange}
                className={donorInputClass}
                placeholder="0000"
              />
            </div>
          </div>
        </div>
      </div>

      {!showPayment ? (
        <button
          onClick={() => setShowPayment(true)}
          className="w-full bg-rsa-gold text-rsa-navy py-4 px-6 rounded-md font-bold text-lg hover:bg-rsa-gold/90 transition-colors"
        >
          Donate ${amount.toFixed(2)} {timing === 'recurring' ? `(${interval})` : ''}
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-rsa-navy mb-4">Payment Details</h2>
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Donation:</span> ${amount.toFixed(2)} {timing === 'recurring' ? `- ${interval}` : ''}
            </p>
            {donorType === 'me' ? (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Donor:</span> {donorData.fullName || 'Not provided'}
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Organisation:</span> {donorData.organisationName || 'Not provided'}
              </p>
            )}
            {!isAnonymous && donorData.email && (
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Receipt will be sent to:</span> {donorData.email}
              </p>
            )}
            {isAnonymous && (
              <p className="text-sm text-orange-600">
                This is an anonymous donation - no receipt will be issued.
              </p>
            )}
          </div>
          <StripePaymentSection
            amount={amount}
            timing={timing}
            interval={timing === 'recurring' ? interval : null}
            donorType={donorType}
            isAnonymous={isAnonymous}
            donorData={donorData}
            onSuccess={handleSuccess}
          />
          <button
            type="button"
            onClick={() => setShowPayment(false)}
            className="mt-4 text-gray-600 underline text-sm"
          >
            Back to details
          </button>
        </div>
      )}
    </div>
  );
}
