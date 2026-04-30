import { useState } from 'react';

export default function WindcavePayment({ amount = 50.00, currency = 'NZD', onSuccess, onError }) {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

      // Call backend to create payment and get redirect URL
      const response = await fetch(`${apiUrl}/api/membership/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          amount,
          currency,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Store pending data
        sessionStorage.setItem('pendingMembership', JSON.stringify({
          txnRef: result.txnRef,
          formData,
        }));

        // Redirect to Windcave
        window.location.href = result.redirectUrl;
      } else {
        alert('Failed to create payment: ' + result.error);
        setProcessing(false);
      }
    } catch (error) {
      console.error('Windcave payment error:', error);
      if (onError) onError(error);
      setProcessing(false);
    }
  };

  return (
    <div className="bg-rsa-navy/5 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-700 font-medium">Membership Fee</p>
          <p className="text-sm text-gray-500">Provisional Membership (1 month)</p>
        </div>
        <p className="text-2xl font-bold text-rsa-gold">${amount.toFixed(2)} {currency}</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-gray-300"></div>
        <span className="text-gray-500 text-sm">Secure Payment via</span>
        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Windcave Badge */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className="bg-white px-4 py-2 rounded border border-gray-200">
          <span className="font-bold text-rsa-navy">WINDCAVE</span>
        </div>
      </div>

      {/* Accepted Cards */}
      <div className="flex justify-center gap-2 mb-4">
        <div className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold">VISA</div>
        <div className="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold">MC</div>
        <div className="bg-blue-400 text-white px-3 py-1 rounded text-xs font-bold">AMEX</div>
      </div>

      <p className="text-center text-gray-600 text-sm mb-4">
        You will be redirected to Windcave's secure payment page
      </p>

      <button
        type="button"
        onClick={handlePayment}
        disabled={processing}
        className="w-full bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-all hover:scale-105 focus:ring-4 focus:ring-green-600/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {processing ? (
          <>
            <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Pay with Windcave
          </>
        )}
      </button>

      {/* Security Info */}
      <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>PCI DSS Compliant - Your card details are secure</span>
      </div>
    </div>
  );
}
