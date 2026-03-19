import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import BookingConfirmation from "../components/BookingConfirmation";
import { toast } from "react-toastify";
import api from "../../services/api";

const BookingConfirmationPage = () => {
    const { state } = useLocation();
    const { id } = useParams();
    const [booking, setBooking] = useState(state?.bookingDetails || null);
    const [loading, setLoading] = useState(!state?.bookingDetails);

    useEffect(() => {
        if (!booking && id) {
            const fetchBooking = async () => {
                try {
                    const res = await api.get(`bookings/${id}`);
                    if (res.data.success) {
                        setBooking(res.data.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch booking:", err);
                    toast.error("Could not load booking details");
                } finally {
                    setLoading(false);
                }
            };
            fetchBooking();
        }
    }, [id, booking]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d140a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#59f20d]"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-[#0d140a] flex items-center justify-center">
                <div className="text-center">
                    <div className="size-20 bg-[#1c2619] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#2e3928]">
                        <span className="material-symbols-outlined text-[#a6ba9c] text-4xl">search_off</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-4">Booking Not Found</h2>
                    <button
                        onClick={() => window.location.href = '/bus-booking'}
                        className="bg-[#59f20d] text-[#0d140a] px-6 py-2.5 rounded-lg font-bold hover:bg-[#4ed40b] transition-all flex items-center mx-auto gap-2"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        Book Another Bus
                    </button>
                </div>
            </div>
        );
    }

    const { 
        bookingId, 
        bus, 
        seats = [], 
        travelDate, 
        totalPrice, 
        paymentMethod, 
        passengerInfo,
        user
    } = booking;

    const formattedDate = travelDate ? new Date(travelDate).toLocaleDateString() : 'N/A';
    const passengerName = passengerInfo?.name || user?.name || 'User';

    return (
        <div className="min-h-screen bg-[#0d140a] flex items-center justify-center p-4">
            <BookingConfirmation
                bookingId={bookingId || id}
                passenger={passengerName}
                bus={bus?.yatayatName ? `${bus.yatayatName} (${bus.busNumber})` : (bus?.name || bus?.busNumber || 'N/A')}
                seat={seats.join(', ')}
                date={formattedDate}
                departure={bus?.schedule?.departure || 'N/A'}
                price={`NPR ${totalPrice}`}
                paymentMethod={paymentMethod}
                from={bus?.route?.from || 'N/A'}
                to={bus?.route?.to || 'N/A'}
                qrCodeUrl={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${bookingId || id}`}
                onPrint={() => window.print()}
                onDownload={() => toast.success("Ticket downloaded successfully")}
                onBookAnother={() => window.location.href = '/bus-booking'}
            />
        </div>
    );
};

export default BookingConfirmationPage;