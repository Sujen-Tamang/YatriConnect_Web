import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserBookingById } from "../../services/bookingService"; // create this if it doesn't exist

const ETicket = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            const res = await getUserBookingById(id);
            if (res.success) {
                setBooking(res.data);
            }
        };
        fetchBooking();
    }, [id]);

    if (!booking) return <div>Loading e-ticket...</div>;

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">E-Ticket for Booking ID: {booking.bookingId || booking._id}</h1>
            {/* Add more details here */}
            <p>Bus: {booking.bus?.busNumber}</p>
            <p>Route: {booking.bus?.route?.from} to {booking.bus?.route?.to}</p>
            <p>Date: {new Date(booking.travelDate).toLocaleDateString()}</p>
            <p>Seats: {booking.seats?.join(', ')}</p>
            <p>Total Price: NPR {booking.totalPrice}</p>
        </div>
    );
};

export default ETicket;
