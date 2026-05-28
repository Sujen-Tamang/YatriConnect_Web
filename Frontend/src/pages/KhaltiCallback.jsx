import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const KhaltiCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('Verifying your payment...');

    useEffect(() => {
        const verifyPayment = async () => {
                        const params = new URLSearchParams(location.search);
            const pidx = params.get('pidx');
            const transaction_id = params.get('transaction_id');
            const amount = params.get('amount');
            const bookingId = params.get('booking') || params.get('purchase_order_id');
            const isMobile = params.get('isMobile') === 'true';

            if (!pidx || !bookingId) {
                setStatus('Invalid payment callback parameters.');
                if (isMobile) {
                    window.location.href = 'yatriconnect://booking?status=failed';
                    setTimeout(() => {
                        setStatus('Invalid parameters! If the app did not open automatically, please click the button below to return.');
                    }, 500);
                } else {
                    setTimeout(() => navigate('/profile/bookings'), 3000);
                }
                return;
            }

            try {
                // Call backend verify endpoint
                const res = await api.post(`payments/khalti/verify?booking=${bookingId}`, {
                    pidx,
                    transaction_id,
                    amount
                }, { withCredentials: true });

                if (res.data.success) {
                    setStatus('Payment Verified Successfully! Redirecting...');
                    toast.success('Payment completed successfully!');
                    if (isMobile) {
                        // Immediately attempt redirect to avoid Safari blocking delayed redirects
                        window.location.href = `yatriconnect://ticket-view?bookingId=${bookingId}`;
                        // Backup in case the automatic redirect is blocked
                        setTimeout(() => {
                            setStatus('Payment Verified! If the app did not open automatically, please click the button below.');
                        }, 1000);
                    } else {
                        setTimeout(() => navigate(`/booking-confirmation/${bookingId}`), 2000);
                    }
                } else {
                    setStatus('Payment verification failed.');
                    toast.error(res.data.message || 'Payment failed.');
                    if (isMobile) {
                        window.location.href = `yatriconnect://booking?bookingId=${bookingId}&status=failed`;
                        setTimeout(() => {
                            setStatus('Payment Failed! If the app did not open automatically, please click the button below to return.');
                        }, 500);
                    } else {
                        setTimeout(() => navigate('/profile/bookings'), 3000);
                    }
                }
            } catch (err) {
                console.error("Verification failed:", err);
                setStatus('Failed to reach verification server.');
                toast.error('Verification error.');
                if (isMobile) {
                    window.location.href = `yatriconnect://booking?bookingId=${bookingId}&status=failed`;
                    setTimeout(() => {
                        setStatus('Verification Error! If the app did not open automatically, please click the button below to return.');
                    }, 500);
                } else {
                    setTimeout(() => navigate('/profile/bookings'), 3000);
                }
            }
        };

        verifyPayment();
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-[#0d140a] flex items-center justify-center p-6 text-white font-sans">
            <div className="bg-[#1c2619] border border-[#2e3928] rounded-xl p-8 max-w-md w-full text-center shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#59f20d] mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold mb-4">Processing Payment</h2>
                <p className="text-[#a6ba9c] mb-6">{status}</p>
                {status.includes('If the app did not open automatically') && (
                    <a
                        href={`yatriconnect://ticket-view?bookingId=${new URLSearchParams(location.search).get('booking') || new URLSearchParams(location.search).get('purchase_order_id')}`}
                        className="inline-block mt-4 bg-[#59f20d] text-black font-semibold px-6 py-2 rounded-lg"
                    >
                        Return to App
                    </a>
                )}
            </div>
        </div>
    );
};

export default KhaltiCallback;
