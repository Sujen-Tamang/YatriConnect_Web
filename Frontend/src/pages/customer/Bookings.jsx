import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getUserBookings, cancelBooking } from "../../../services/bookingService";
import { toast } from "react-toastify";

const Bookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUserBookings();
      if (res.success) {
        setBookings(res.data.data || []);
      } else {
        setError(res.message);
        toast.error(res.message || 'Failed to fetch bookings');
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('An unexpected error occurred');
      toast.error('Failed to fetch your bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!id) { toast.error('Invalid booking ID'); return; }
    setCancelingId(id);
    try {
      const res = await cancelBooking(id);
      if (res.success) {
        toast.success('Booking cancelled successfully');
        fetchBookings();
      } else {
        toast.error(res.message || 'Failed to cancel booking');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('An error occurred while cancelling your booking');
    } finally {
      setCancelingId(null);
    }
  };

  const sortedBookings = [...bookings].sort((a, b) => {
    const dateA = new Date(a.travelDate || a.date || 0);
    const dateB = new Date(b.travelDate || b.date || 0);
    return dateB - dateA;
  });

  return (
    <div className="min-h-screen bg-[#0d140a]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center bg-[#1c2619] border border-[#2e3928] text-white px-4 py-2 rounded-lg font-medium hover:border-[#59f20d]/30 transition-all"
          >
            <span className="material-symbols-outlined mr-2 text-lg">arrow_back</span>
            Back
          </button>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-white mb-8 flex items-center gap-3"
        >
          <span className="material-symbols-outlined text-[#59f20d] text-3xl">receipt_long</span>
          My Bookings
        </motion.h1>

        {/* Bookings Count */}
        <div className="bg-[#1c2619] rounded-xl border border-[#2e3928] overflow-hidden mb-8">
          <div className="flex justify-between items-center px-6 py-3">
            <h2 className="text-sm font-medium text-[#a6ba9c]">All Bookings</h2>
            <span className="bg-[#59f20d]/10 text-[#59f20d] text-xs font-medium px-2.5 py-0.5 rounded-full border border-[#59f20d]/20">
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#59f20d] mb-4"></div>
            <p className="text-[#a6ba9c]">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-400">{error}</div>
        ) : sortedBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="size-20 bg-[#1c2619] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#2e3928]">
              <span className="material-symbols-outlined text-[#a6ba9c] text-4xl">inbox</span>
            </div>
            <h3 className="text-white text-xl font-bold mb-2">No Bookings Yet</h3>
            <p className="text-[#a6ba9c]">Your booking history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {sortedBookings.map((b) => (
              <motion.div
                key={b._id || b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-[#1c2619] border border-[#2e3928] rounded-xl p-6 hover:border-[#59f20d]/20 transition-all"
              >
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  {/* Bus Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="material-symbols-outlined text-[#59f20d]">directions_bus</span>
                      <span className="text-xl font-bold text-white">{b.bus?.busNumber || 'Bus'}</span>
                    </div>
                    <div className="text-xs text-[#a6ba9c] mb-3">Booking ID: {b.bookingId || b._id}</div>
                    <div className="flex flex-wrap gap-4 text-sm text-[#a6ba9c]">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#59f20d]/60 text-base">route</span>
                        <span className="font-medium text-white">{b.bus?.route?.from && b.bus?.route?.to ? `${b.bus.route.from} → ${b.bus.route.to}` : (b.route || 'N/A')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#59f20d]/60 text-base">calendar_today</span>
                        <span className="font-medium text-white">{new Date(b.travelDate || b.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#59f20d]/60 text-base">schedule</span>
                        <span className="font-medium text-white">{b.bus?.schedule?.departureTime || b.departureTime || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-1.5 min-w-[180px] text-sm">
                    <div className="flex items-center gap-1.5 text-[#a6ba9c]">
                      <span className="material-symbols-outlined text-base">event_seat</span>
                      Seats: <span className="text-white font-medium">{Array.isArray(b.seats) ? b.seats.join(', ') : (b.seatNumber || 'N/A')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#a6ba9c]">
                      <span className="material-symbols-outlined text-base">payments</span>
                      Price: <span className="text-[#59f20d] font-medium">NPR {b.totalPrice || b.amount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#a6ba9c]">
                      <span className="material-symbols-outlined text-base">credit_card</span>
                      Payment: <span className="text-white font-medium">{b.payment ? 'Paid' : (b.paymentStatus || 'Pending')}</span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex flex-col gap-2 items-end min-w-[160px]">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      b.status === 'Confirmed' || b.status === 'confirmed' ? 'bg-[#59f20d]/10 text-[#59f20d] border-[#59f20d]/20' :
                      b.status === 'Cancelled' || b.status === 'Canceled' || b.status === 'cancelled' || b.status === 'canceled' ? 'bg-red-900/30 text-red-400 border-red-500/20' :
                      b.status === 'Pending' || b.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/20' :
                      'bg-[#59f20d]/10 text-[#59f20d] border-[#59f20d]/20'
                    }`}>
                      {b.status}
                    </span>
                    {(b.status === 'Confirmed' || b.status === 'confirmed' || b.status === 'Pending' || b.status === 'pending') && (
                      <button
                        className="px-4 py-2 bg-red-900/30 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-900/50 text-sm flex items-center gap-1 transition-all mt-2"
                        onClick={() => handleCancel(b._id || b.id)}
                        disabled={cancelingId === (b._id || b.id)}
                      >
                        {cancelingId === (b._id || b.id) ? 'Canceling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;