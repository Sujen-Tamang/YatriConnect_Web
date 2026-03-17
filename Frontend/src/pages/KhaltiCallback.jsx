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

            if (!pidx || !bookingId) {
                setStatus('Invalid payment callback parameters.');
                setTimeout(() => navigate('/profile/bookings'), 3000);
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
                    setTimeout(() => navigate(`/booking-confirmation/${bookingId}`), 2000);
                } else {
                    setStatus('Payment verification failed.');
                    toast.error(res.data.message || 'Payment failed.');
                    setTimeout(() => navigate('/profile/bookings'), 3000);
                }
            } catch (err) {
                console.error("Verification failed:", err);
                setStatus('Failed to reach verification server.');
                toast.error('Verification error.');
                setTimeout(() => navigate('/profile/bookings'), 3000);
            }
        };

        verifyPayment();
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-[#0d140a] flex items-center justify-center p-6 text-white font-sans">
            <div className="bg-[#1c2619] border border-[#2e3928] rounded-xl p-8 max-w-md w-full text-center shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#59f20d] mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold mb-4">Processing Payment</h2>
                <p className="text-[#a6ba9c]">{status}</p>
            </div>
        </div>
    );
};

export default KhaltiCallback;
