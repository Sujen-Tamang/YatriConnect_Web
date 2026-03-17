// pages/PaymentVerification.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PaymentVerification = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        const verifyPayment = async () => {
            const pidx = searchParams.get('pidx');
            const transaction_id = searchParams.get('transaction_id');
            const amount = searchParams.get('amount');
            const bookingId = searchParams.get('booking');

            if (!pidx || !transaction_id || !amount || !bookingId) {
                setStatus('failed');
                setMessage('Invalid payment verification parameters');
                return;
            }

            try {
                // Verify payment with backend
                const response = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/payments/khalti/verify`,
                    { pidx, transaction_id, amount },
                    { params: { booking: bookingId }, withCredentials: true }
                );

                if (response.data.success) {
                    setStatus('success');
                    setMessage('Payment verified successfully!');
                    // You might want to redirect to booking confirmation page
                } else {
                    setStatus('failed');
                    setMessage('Payment verification failed');
                }
            } catch (error) {
                setStatus('failed');
                setMessage(error.response?.data?.message || 'Payment verification error');
            }
        };

        verifyPayment();
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                {status === 'verifying' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold mb-2">Processing Payment</h2>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="text-green-500 text-5xl mb-4">✓</div>
                        <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <div className="text-red-500 text-5xl mb-4">✗</div>
                        <h2 className="text-xl font-semibold mb-2">Payment Failed</h2>
                    </>
                )}

                <p className="text-gray-600">{message}</p>

                {status !== 'verifying' && (
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-6 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                    >
                        Return Home
                    </button>
                )}
            </div>
        </div>
    );
};

export default PaymentVerification;