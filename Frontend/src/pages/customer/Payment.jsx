// pages/Payment.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaRupeeSign } from 'react-icons/fa';
import KhaltiCheckoutButton from "../../components/KhaltiCheckoutButton.jsx";
import api from "../../../services/api";


const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        if (!location.state?.booking) {
            toast.error("No booking information found");
            navigate('/bus-booking');
            return;
        }
        setBooking(location.state.booking);
    }, [location, navigate]);

    const handleKhaltiSuccess = async (payload) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post(
                'payments/khalti/verify',
                {
                    pidx: payload.idx,
                    transaction_id: payload.idx,
                    amount: payload.amount / 100
                },
                {
                    params: { booking: booking.bus.id },
                }
            );

            if (response.data.success) {
                const bookingResponse = await api.post(
                    'bookings',
                    {
                        bus: booking.bus.id,
                        journeyDate: booking.journeyDate,
                        seats: booking.selectedSeats,
                        payment: response.data.paymentId,
                        totalAmount: booking.totalAmount,
                        passengerInfo: booking.passengerInfo
                    }
                );

                if (bookingResponse.data.success) {
                    navigate(`/bookingConfirmationPage/${bookingResponse.data.booking._id}`, {
                        state: {
                            bookingDetails: {
                                ...bookingResponse.data.booking,
                                paymentMethod: booking.paymentMethod,
                                busDetails: booking.bus
                            }
                        }
                    });
                } else {
                    throw new Error('Booking creation failed');
                }
            } else {
                throw new Error('Payment verification failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Payment processing error');
            console.error('Payment error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleKhaltiError = (error) => {
        setError(error.message || 'Payment failed');
    };

    if (!booking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Loading booking information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0d140a] py-10 px-4">
            <div className="max-w-2xl mx-auto bg-[#1c2619] border border-[#2e3928] rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="p-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-[#59f20d] hover:text-[#4ed40b] transition-colors mb-6 text-sm font-medium"
                    >
                        <FaArrowLeft className="mr-2" /> Back to booking
                    </button>

                    <h1 className="text-2xl font-bold text-white mb-2">Complete Your Payment</h1>
                    <p className="text-[#a6ba9c] mb-6">Please complete your payment to confirm your booking</p>

                    <div className="bg-[#0d140a] border border-[#2e3928] rounded-lg p-6 mb-6">
                        <h2 className="font-semibold text-lg text-white mb-4">Booking Summary</h2>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-[#a6ba9c] text-sm">Bus</p>
                                <p className="font-medium text-white">{booking.bus.name || booking.bus.busNumber}</p>
                            </div>
                            <div>
                                <p className="text-[#a6ba9c] text-sm">Date</p>
                                <p className="font-medium text-white">{new Date(booking.journeyDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[#a6ba9c] text-sm">Route</p>
                                <p className="font-medium text-white">{booking.bus.route?.from} → {booking.bus.route?.to}</p>
                            </div>
                            <div>
                                <p className="text-[#a6ba9c] text-sm">Seats</p>
                                <p className="font-medium text-white">{booking.selectedSeats.join(', ')}</p>
                            </div>
                        </div>

                        <div className="border-t border-[#2e3928] pt-4 mt-4">
                            <div className="flex justify-between items-center">
                                <p className="text-[#a6ba9c]">Total Amount</p>
                                <p className="text-xl font-bold text-[#59f20d] flex items-center">
                                    <FaRupeeSign className="mr-1" /> {booking.totalAmount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="space-y-3">
                            {booking.paymentMethod === "Khalti" && (
                                <KhaltiCheckoutButton
                                    amount={booking.totalAmount}
                                    bookingId={booking.bus._id || booking.bus.id}
                                    busId={booking.bus._id || booking.bus.id}
                                    seats={booking.selectedSeats}
                                    journeyDate={booking.journeyDate}
                                    disabled={loading}
                                    buttonText={loading ? 'Processing Payment...' : 'Pay with Khalti'}
                                />
                            )}

                            {booking.paymentMethod === "Esewa" && (
                                <EsewaCheckoutButton
                                    amount={booking.totalAmount}
                                    bookingId={booking.bus.id}
                                    onError={handleEsewaError}
                                    buttonText={loading ? 'Redirecting to eSewa...' : 'Pay with eSewa'}
                                    disabled={loading}
                                />
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <p className="text-sm text-[#a6ba9c] text-center mt-6">
                        Your payment is securely processed by {booking.paymentMethod === "Esewa" ? "eSewa" : "Khalti"}. We don't store your payment details.
                    </p>

                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
