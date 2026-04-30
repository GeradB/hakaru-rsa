import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function MembershipSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [membershipData, setMembershipData] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const txnRef = searchParams.get('txnref');
      const status = searchParams.get('status');

      if (!txnRef) {
        setStatus('no-ref');
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/api/membership/status/${txnRef}`);
        const result = await response.json();

        if (result.success) {
          setStatus(result.status);

          // Load pending data from session
          const pending = sessionStorage.getItem('pendingMembership');
          if (pending) {
            setMembershipData(JSON.parse(pending));
          }
        } else {
          setStatus('not-found');
        }
      } catch (error) {
        console.error('Error checking status:', error);
        setStatus('error');
      }
    };

    checkPaymentStatus();
  }, [searchParams]);

  return (
    <div className="bg-gradient-to-b from-rsa-navy via-slate-800 to-rsa-navy min-h-screen py-16">
      <div className="max-w-2xl mx-auto px-4">
        {status === 'paid' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold font-heading text-rsa-navy mb-4">
              Payment Successful!
            </h1>

            <p className="text-gray-600 mb-6">
              Thank you for your membership application. A confirmation email has been sent to:
            </p>

            {membershipData && (
              <p className="text-lg font-bold text-rsa-navy mb-6">
                {membershipData.formData?.email}
              </p>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                <strong>Transaction Reference:</strong> {searchParams.get('txnref')}
              </p>
              <p className="text-green-800 text-sm mt-2">
                You will receive your membership card shortly.
              </p>
            </div>

            <Link
              to="/"
              className="inline-block bg-rsa-gold text-rsa-navy px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        )}

        {status === 'pending' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold font-heading text-rsa-navy mb-4">
              Payment Pending
            </h1>

            <p className="text-gray-600 mb-6">
              Your payment is being processed. Please wait a moment...
            </p>

            <div className="animate-pulse">
              <div className="h-2 bg-gray-200 rounded w-48 mx-auto"></div>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold font-heading text-rsa-navy mb-4">
              Payment Failed
            </h1>

            <p className="text-gray-600 mb-6">
              Unfortunately, your payment could not be processed.
            </p>

            <div className="flex gap-4 justify-center">
              <Link
                to="/membership/become"
                className="inline-block bg-rsa-gold text-rsa-navy px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
              >
                Try Again
              </Link>
              <Link
                to="/contact"
                className="inline-block bg-rsa-navy text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}

        {status === 'checking' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-rsa-gold border-t-transparent rounded-full mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold font-heading text-rsa-navy mb-4">
              Checking Payment Status...
            </h1>
          </div>
        )}

        {status === 'no-ref' && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold font-heading text-rsa-navy mb-4">
              No Transaction Found
            </h1>

            <p className="text-gray-600 mb-6">
              Please return to the membership form and try again.
            </p>

            <Link
              to="/membership/become"
              className="inline-block bg-rsa-gold text-rsa-navy px-8 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
            >
              Back to Membership Form
            </Link>
          </div>
        )}

        {(status === 'error' || status === 'not-found') && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold font-heading text-rsa-navy mb-4">
              Unable to Verify Payment
            </h1>

            <p className="text-gray-600 mb-6">
              Please contact us to verify your membership application.
            </p>

            <Link
              to="/contact"
              className="inline-block bg-rsa-navy text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
