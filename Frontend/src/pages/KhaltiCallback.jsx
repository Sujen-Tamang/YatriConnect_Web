import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';

const KhaltiCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [status, setStatus] = useState('Verifying your payment...');
    const [returnLinkHref, setReturnLinkHref] = useState('');

    const safeDecode = (value) => {
        if (!value) {
            return '';
        }
        try {
            return decodeURIComponent(value);
        } catch {
            return value;
        }
    };

    const buildRedirectUrl = (baseUrl, bookingId, statusValue) => {
        if (!baseUrl || !bookingId) {
            return '';
        }
        try {
            const url = new URL(baseUrl);
            url.searchParams.set('bookingId', bookingId);
            if (statusValue) {
                url.searchParams.set('status', statusValue);
            }
            return url.toString();
        } catch {
            const separator = baseUrl.includes('?') ? '&' : '?';
            const statusPart = statusValue ? `&status=${encodeURIComponent(statusValue)}` : '';
            return `${baseUrl}${separator}bookingId=${encodeURIComponent(bookingId)}${statusPart}`;
        }
    };

    useEffect(() => {
        const MAX_RETRIES = 6;
        const RETRY_DELAY_MS = 3000;
        let retryTimeoutId;
        let isActive = true;

        const shouldRetry = (statusValue) => {
            if (!statusValue) {
                return false;
            }
            const normalized = String(statusValue).toLowerCase();
            return normalized === 'pending' || normalized === 'initiated' || normalized === 'processing';
        };

        const scheduleRetry = (attempt) => {
            if (!isActive) {
                return;
            }
            retryTimeoutId = setTimeout(() => {
                if (isActive) {
                    verifyPayment(attempt + 1);
                }
            }, RETRY_DELAY_MS);
        };

        const verifyPayment = async (attempt = 0) => {
            const params = new URLSearchParams(location.search);
            const pidx = params.get('pidx');
            const transaction_id = params.get('transaction_id');
            const amount = params.get('amount');
            const bookingId = params.get('booking') || params.get('purchase_order_id');
            const isMobile = params.get('isMobile') === 'true';
            const redirectBase = safeDecode(params.get('redirectUrl'));
            const successRedirect = buildRedirectUrl(redirectBase, bookingId);
            const failureRedirect = buildRedirectUrl(redirectBase, bookingId, 'failed');

            if (!pidx || !bookingId) {
                setStatus('Invalid payment callback parameters.');
                if (isMobile) {
                    const invalidRedirect = redirectBase || 'yatriconnect://booking?status=failed';
                    window.location.href = invalidRedirect;
                    setReturnLinkHref(invalidRedirect);
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
                        const mobileSuccessUrl = successRedirect || `yatriconnect://ticket-view?bookingId=${bookingId}`;
                        // Immediately attempt redirect to avoid Safari blocking delayed redirects
                        window.location.href = mobileSuccessUrl;
                        setReturnLinkHref(mobileSuccessUrl);
                        // Backup in case the automatic redirect is blocked
                        setTimeout(() => {
                            setStatus('Payment Verified! If the app did not open automatically, please click the button below.');
                        }, 1000);
                    } else {
                        setTimeout(() => navigate(`/booking-confirmation/${bookingId}`), 2000);
                    }
                } else {
                    const verificationStatus = res.data?.verification?.status;
                    if (shouldRetry(verificationStatus) && attempt < MAX_RETRIES) {
                        setStatus(`Payment pending... retrying (${attempt + 1}/${MAX_RETRIES})`);
                        scheduleRetry(attempt);
                        return;
                    }
                    setStatus('Payment verification failed.');
                    toast.error(res.data.message || 'Payment failed.');
                    if (isMobile) {
                        const mobileFailureUrl = failureRedirect || `yatriconnect://booking?bookingId=${bookingId}&status=failed`;
                        window.location.href = mobileFailureUrl;
                        setReturnLinkHref(mobileFailureUrl);
                        setTimeout(() => {
                            setStatus('Payment Failed! If the app did not open automatically, please click the button below to return.');
                        }, 500);
                    } else {
                        setTimeout(() => navigate('/profile/bookings'), 3000);
                    }
                }
            } catch (err) {
                const verificationStatus = err?.response?.data?.verification?.status;
                if (shouldRetry(verificationStatus) && attempt < MAX_RETRIES) {
                    setStatus(`Payment pending... retrying (${attempt + 1}/${MAX_RETRIES})`);
                    scheduleRetry(attempt);
                    return;
                }
                console.error("Verification failed:", err);
                setStatus('Failed to reach verification server.');
                toast.error('Verification error.');
                if (isMobile) {
                    const mobileFailureUrl = failureRedirect || `yatriconnect://booking?bookingId=${bookingId}&status=failed`;
                    window.location.href = mobileFailureUrl;
                    setReturnLinkHref(mobileFailureUrl);
                    setTimeout(() => {
                        setStatus('Verification Error! If the app did not open automatically, please click the button below to return.');
                    }, 500);
                } else {
                    setTimeout(() => navigate('/profile/bookings'), 3000);
                }
            }
        };

        verifyPayment();

        return () => {
            isActive = false;
            if (retryTimeoutId) {
                clearTimeout(retryTimeoutId);
            }
        };
    }, [location, navigate]);

    return (
        <div className="min-h-screen bg-[#0d140a] flex items-center justify-center p-6 text-white font-sans">
            <div className="bg-[#1c2619] border border-[#2e3928] rounded-xl p-8 max-w-md w-full text-center shadow-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#59f20d] mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold mb-4">Processing Payment</h2>
                <p className="text-[#a6ba9c] mb-6">{status}</p>
                {returnLinkHref && (
                    <a
                        href={returnLinkHref}
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
