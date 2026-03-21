import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAvailableSeats } from "../../../services/busService";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { FaUser, FaRupeeSign } from "react-icons/fa";

const seatLetters = ["A", "B", "C", "D"];

const BookingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [payment, setPayment] = useState("Khalti");
  const [busData, setBusData] = useState(null);
  const [journeyDate, setJourneyDate] = useState("");
  const [seatData, setSeatData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seatLayout, setSeatLayout] = useState({
    rows: 6,
    cols: 4,
    letters: ["A", "B", "C", "D"]
  });

  useEffect(() => {
    if (location.state && location.state.bus) {
      setBusData(location.state.bus);
      setJourneyDate(location.state.journeyDate || "");
    } else {
      navigate("/bus-booking");
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchSeats = async () => {
      if (!busData?.id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await getAvailableSeats(busData.id);
        if (response.success && response.data) {
          if (response.data.data && response.data.data.seats) {
            setSeatData(response.data.data.seats);
            if (response.data.data.seats.length > 0) {
              const rowNumbers = [...new Set(response.data.data.seats.map(seat => parseInt(seat.number.match(/^\d+/)[0])))];
              rowNumbers.sort((a, b) => a - b);
              setSeatLayout(prev => ({ ...prev, rows: Math.max(...rowNumbers) }));
            }
          } else {
            const fallbackSeats = generateFallbackSeats();
            setSeatData(fallbackSeats);
            setSeatLayout(prev => ({ ...prev, rows: 7 }));
          }
        } else {
          throw new Error(response.message || 'Failed to fetch seat availability');
        }
      } catch (err) {
        setError(err.message || 'An error occurred while fetching seat availability');
        const fallbackSeats = generateFallbackSeats();
        setSeatData(fallbackSeats);
        setSeatLayout(prev => ({ ...prev, rows: 7 }));
      } finally {
        setLoading(false);
      }
    };
    fetchSeats();
  }, [busData, journeyDate]);

  const generateFallbackSeats = () => {
    const seats = [];
    for (let row = 1; row <= 7; row++) {
      for (const letter of seatLetters) {
        seats.push({
          number: `${row}${letter}`,
          available: !(row === 3 && (letter === 'A' || letter === 'B')) && !(row === 4 && (letter === 'A' || letter === 'B')),
          features: []
        });
      }
    }
    return seats;
  };

  const handleSeatClick = (seatNumber) => {
    const seat = seatData.find(s => s.number === seatNumber);
    if (!seat || !seat.available) return;
    setSelectedSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : prev.length < 10 ? [...prev, seatNumber] : prev
    );
  };

  const handlePaymentChange = (e) => setPayment(e.target.value);

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to proceed with payment");
      sessionStorage.setItem('pendingBooking', JSON.stringify({ busData, journeyDate, selectedSeats, payment, totalPrice }));
      navigate('/auth/signin', { state: { from: location.pathname } });
      return;
    }
    if (!currentUser) {
      toast.error("User data is loading, please wait...");
      return;
    }
    const isUserVerified = currentUser?.isVerified || currentUser?.verified || currentUser?.user?.isVerified;
    if (!isUserVerified) {
      toast.error("Your account needs to be verified before making a payment");
      sessionStorage.setItem('pendingBooking', JSON.stringify({ busData, journeyDate, selectedSeats, payment, totalPrice }));
      navigate('/auth/verify', { state: { from: location.pathname } });
      return;
    }
    const bookingData = { bus: busData, journeyDate, selectedSeats, totalAmount: totalPrice, paymentMethod: payment, passengerInfo: form };
    if (payment === "Khalti" || payment === "Esewa") {
      navigate('/payment', { state: { booking: bookingData } });
    } else {
      toast.error("Selected payment method is not available yet");
    }
  };

  const ticketPrice = busData?.price || (busData?.data?.price) || 700;
  const totalPrice = ticketPrice * selectedSeats.length;

  return (
    <div className="min-h-screen bg-[#0d140a] py-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Main Booking Details */}
        <div className="md:col-span-2 bg-[#1c2619] border border-[#2e3928] rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-[#59f20d]">confirmation_number</span>
            <h2 className="text-lg font-bold text-white">Booking Details</h2>
          </div>

          {/* Seat Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white text-center mb-4">Select Your Seat</h3>
            <div className="bg-[#0d140a] rounded-xl p-6 border border-[#2e3928]">
              <div className="flex justify-between text-[#a6ba9c] text-sm mb-3 px-4">
                <span>Driver</span>
                <span>Door</span>
              </div>

              {loading ? (
                <div className="flex justify-center items-center p-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#59f20d]"></div>
                </div>
              ) : error ? (
                <div className="text-red-400 p-4 text-center text-sm">
                  {error}
                  <button onClick={() => window.location.reload()} className="block mx-auto mt-2 text-[#59f20d] underline text-sm">
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {/* Driver's Cabin */}
                  <div className="w-full flex justify-center mb-4">
                    <div className="bg-[#2e3928] rounded-t-lg w-32 h-8 flex items-center justify-center text-[#a6ba9c] font-medium text-xs">
                      Driver's Cabin
                    </div>
                  </div>

                  {/* Seat Grid */}
                  <div className="grid grid-cols-4 gap-x-8 gap-y-2">
                    {seatData.map((seat) => {
                      const seatNumber = seat.number;
                      const isAvailable = seat.available;
                      const isSelected = selectedSeats.includes(seatNumber);
                      const colIdx = seatLayout.letters.indexOf(seatNumber.charAt(seatNumber.length - 1));
                      let positionClass = colIdx === 2 ? "ml-4" : "";

                      return (
                        <button
                          key={seatNumber}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center border text-xs relative transition-all ${positionClass}
                            ${!isAvailable ? "bg-red-900/20 text-red-400/60 border-red-500/20 cursor-not-allowed" :
                              isSelected ? "bg-[#59f20d]/20 text-[#59f20d] border-[#59f20d] shadow-[0_0_8px_rgba(89,242,13,0.2)]" :
                                "bg-[#1c2619] text-[#a6ba9c] border-[#2e3928] hover:border-[#59f20d]/50 hover:bg-[#59f20d]/5"
                            }`}
                          disabled={!isAvailable}
                          onClick={() => handleSeatClick(seatNumber)}
                        >
                          <span className="absolute top-0.5 left-1 text-[9px]">{seatNumber}</span>
                          <FaUser className="text-[10px]" />
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex gap-6 mt-6 text-xs">
                    <div className="flex items-center gap-1.5 text-[#59f20d]">
                      <span className="w-4 h-4 bg-[#59f20d]/20 border border-[#59f20d] rounded inline-block"></span> Selected
                    </div>
                    <div className="flex items-center gap-1.5 text-[#a6ba9c]">
                      <span className="w-4 h-4 bg-[#1c2619] border border-[#2e3928] rounded inline-block"></span> Available
                    </div>
                    <div className="flex items-center gap-1.5 text-red-400/60">
                      <span className="w-4 h-4 bg-red-900/20 border border-red-500/20 rounded inline-block"></span> Booked
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-8">
            <h3 className="font-semibold text-white mb-3">Payment Method</h3>
            <div className="flex flex-col gap-3">
              <label className={`flex items-center border rounded-lg px-4 py-3 cursor-pointer transition-all ${payment === "Khalti" ? "border-[#59f20d] bg-[#59f20d]/5" : "border-[#2e3928] bg-[#0d140a]"}`}>
                <input type="radio" name="payment" value="Khalti" checked={payment === "Khalti"} onChange={handlePaymentChange} className="mr-3 accent-[#59f20d]" />
                <img src="https://seeklogo.com/images/K/khalti-wallet-logo-0B1F0C6E5A-seeklogo.com.png" alt="Khalti" className="w-6 h-6 mr-2" />
                <span className="text-white text-sm">Pay with Khalti</span>
              </label>
            </div>
          </div>

          {/* Proceed Button */}
          <button
            className="w-full bg-[#59f20d] text-[#0d140a] font-bold py-3 rounded-lg flex items-center justify-center gap-2 text-lg hover:bg-[#4ed40b] shadow-[0_0_15px_rgba(89,242,13,0.2)] hover:shadow-[0_0_25px_rgba(89,242,13,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={selectedSeats.length === 0}
            onClick={handleProceedToPayment}
          >
            <span className="material-symbols-outlined">payments</span>
            Proceed to Payment (NPR {totalPrice})
          </button>
          {selectedSeats.length === 0 && (
            <p className="text-[#a6ba9c] text-center mt-2 text-sm">Please select at least one seat</p>
          )}
        </div>

        {/* Booking Summary Sidebar */}
        <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl p-6 h-fit sticky top-24">
          <div className="flex items-center gap-2 mb-5">
            <span className="material-symbols-outlined text-[#59f20d]">receipt_long</span>
            <h2 className="text-lg font-bold text-white">Booking Summary</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-[#a6ba9c]">
              <span className="material-symbols-outlined text-[#59f20d]/60 text-base">trip_origin</span>
              <span>From: <span className="text-white font-medium">{busData?.route?.from || "Loading..."}</span></span>
            </div>
            <div className="flex items-center gap-2 text-[#a6ba9c]">
              <span className="material-symbols-outlined text-[#59f20d]/60 text-base">location_on</span>
              <span>To: <span className="text-white font-medium">{busData?.route?.to || "Loading..."}</span></span>
            </div>
            <div className="flex items-center gap-2 text-[#a6ba9c]">
              <span className="material-symbols-outlined text-[#59f20d]/60 text-base">calendar_today</span>
              <span>Date: <span className="text-white font-medium">{journeyDate ? new Date(journeyDate).toLocaleDateString() : "Select a date"}</span></span>
            </div>
            <div className="flex items-center gap-2 text-[#a6ba9c]">
              <span className="material-symbols-outlined text-[#59f20d]/60 text-base">directions_bus</span>
              <span className="text-white font-medium">{busData?.name || busData?.busNumber || "Loading..."}</span>
            </div>
            <div className="flex items-center gap-2 text-[#a6ba9c]">
              <span className="material-symbols-outlined text-[#59f20d]/60 text-base">schedule</span>
              <span>Departure: <span className="text-white font-medium">{busData?.schedule?.departure || "TBD"}</span></span>
            </div>
          </div>

          <div className="border-t border-[#2e3928] my-5"></div>

          {/* Price Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center text-[#a6ba9c]">
              <span>Ticket Price:</span>
              <span className="text-white font-medium">NPR {ticketPrice}</span>
            </div>
            <div className="flex justify-between items-center text-[#a6ba9c]">
              <span>Selected Seats:</span>
              <span className="text-white font-medium">{selectedSeats.length} {selectedSeats.length === 1 ? 'seat' : 'seats'}</span>
            </div>
            {selectedSeats.length > 0 && (
              <div className="flex justify-between items-center text-[#a6ba9c]">
                <span>Seat Numbers:</span>
                <span className="text-[#59f20d] font-medium">{selectedSeats.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="border-t border-[#2e3928] my-4"></div>

          <div className="flex items-center justify-between text-[#59f20d] font-bold text-lg">
            <span>Total:</span>
            <span>NPR {totalPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;