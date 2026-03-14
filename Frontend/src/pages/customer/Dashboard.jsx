import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { getMyBookings } from "../../../services/userService";

const Dashboard = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derived stats from real booking data
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalSpent: 0,
    confirmedTrips: 0,
    cancelledTrips: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getMyBookings();
        if (res.success && res.data?.data) {
          const allBookings = res.data.data;
          setBookings(allBookings);

          // Compute stats from real data
          const confirmed = allBookings.filter(b => b.status === 'Confirmed' || b.status === 'Completed');
          const cancelled = allBookings.filter(b => b.status === 'Cancelled');
          const totalSpent = confirmed.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

          setStats({
            totalTrips: allBookings.length,
            totalSpent,
            confirmedTrips: confirmed.length,
            cancelledTrips: cancelled.length,
          });
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        toast.error('Could not load your booking data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleVerifyAccount = () => navigate("/auth/verify");
  const handleBack = () => navigate(-1);

  // Separate upcoming and past bookings
  const now = new Date();
  const upcomingBookings = bookings.filter(b =>
    b.status === 'Confirmed' && b.travelDate && new Date(b.travelDate) >= now
  );
  const recentBookings = bookings.slice(0, 5); // Last 5 bookings as activity

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-NP', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-[#59f20d]/10 text-[#59f20d] border-[#59f20d]/30';
      case 'Completed': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Cancelled': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'Pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default: return 'bg-[#a6ba9c]/10 text-[#a6ba9c] border-[#a6ba9c]/30';
    }
  };

  return (
    <div className="bg-[#0d140a] min-h-screen selection:bg-[#59f20d]/30 selection:text-[#59f20d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Action Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
            >
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-[#a6ba9c] hover:text-white transition-colors group"
                >
                    <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span className="text-sm font-medium uppercase tracking-wider">Back</span>
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                 <Link
                  to="/bus-booking"
                  className="bg-[#59f20d] text-[#0d140a] px-6 py-2.5 rounded-xl font-black hover:bg-[#4ed40b] shadow-[0_0_15px_rgba(89,242,13,0.3)] hover:shadow-[0_0_25px_rgba(89,242,13,0.5)] transition-all flex items-center gap-2 active:scale-95 text-sm"
                >
                  <span className="material-symbols-outlined font-black text-[20px]">add_circle</span>
                  BOOK NEW TICKET
                </Link>
            </motion.div>
        </div>

        {/* User Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1c2619] border border-[#2e3928] rounded-3xl p-8 mb-8 relative overflow-hidden group hover:border-[#59f20d]/20 transition-all shadow-2xl"
        >
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#59f20d]/5 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="size-20 bg-[#59f20d] rounded-2xl flex items-center justify-center text-[#0d140a] text-3xl font-black shadow-[0_0_20px_rgba(89,242,13,0.4)]">
                {currentUser?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
                Hey, <span className="text-[#59f20d]">{currentUser?.name || "Traveler"}!</span>
              </h1>
              <p className="text-[#a6ba9c] text-lg font-medium opacity-80">
                You've completed <span className="text-white font-bold">{stats.confirmedTrips} successful journeys</span> with YatriConnect.
              </p>
              
              {!currentUser?.isVerified && (
                <button 
                  onClick={handleVerifyAccount}
                  className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-lg text-xs font-bold hover:bg-yellow-500/20 transition-all mx-auto md:mx-0"
                >
                  <span className="material-symbols-outlined text-sm">warning</span>
                  VERIFY YOUR ACCOUNT FOR SECURITY
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Bookings', value: stats.totalTrips, icon: 'receipt_long', color: '#59f20d' },
            { label: 'Amount Spent', value: `NPR ${stats.totalSpent}`, icon: 'payments', color: '#59f20d' },
            { label: 'Confirmed', value: stats.confirmedTrips, icon: 'check_circle', color: '#59f20d' },
            { label: 'Cancelled', value: stats.cancelledTrips, icon: 'cancel', color: '#f87171' }
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="bg-[#1c2619] border border-[#2e3928] p-6 rounded-2xl hover:border-[#59f20d]/30 transition-all shadow-lg group"
            >
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-xl bg-[#0d140a] border border-[#2e3928] flex items-center justify-center group-hover:bg-[#59f20d]/10 transition-colors">
                  <span className="material-symbols-outlined text-[20px]" style={{ color: item.color }}>{item.icon}</span>
                </div>
                <div>
                  <p className="text-[#a6ba9c] text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{item.label}</p>
                  <h3 className="text-xl md:text-2xl font-black text-white">
                    {loading ? '...' : item.value}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Activity Section */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#1c2619] border border-[#2e3928] rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-8 py-6 border-b border-[#2e3928] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#59f20d]">event_note</span>
                    <h2 className="text-xl font-black text-white">UPCOMING TRIPS</h2>
                </div>
                <Link to="/customer/bookings" className="text-xs font-bold text-[#a6ba9c] hover:text-[#59f20d] tracking-widest transition-colors flex items-center gap-1 group uppercase">
                  View full history
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>

              <div className="divide-y divide-[#2e3928]">
                {loading ? (
                  <div className="p-20 flex justify-center">
                    <div className="size-8 border-2 border-[#59f20d] border-t-transparent animate-spin rounded-full"></div>
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => (
                    <div key={booking._id} className="p-8 hover:bg-[#0d140a]/50 transition-colors group relative overflow-hidden">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex-1">
                          <div className="flex items-center mb-3 gap-3">
                            <span className="text-lg md:text-xl font-black text-white">
                              {booking.bus?.route?.from || 'N/A'}
                            </span>
                            <span className="material-symbols-outlined text-[#59f20d] opacity-40">trending_flat</span>
                            <span className="text-lg md:text-xl font-black text-white">
                              {booking.bus?.route?.to || 'N/A'}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                            <span className="flex items-center gap-2 text-[#a6ba9c] bg-[#0d140a] px-3 py-1 rounded-lg border border-[#2e3928]">
                              <span className="material-symbols-outlined text-sm">calendar_today</span>
                              {formatDate(booking.travelDate)}
                            </span>
                            <span className="text-[#a6ba9c] flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-sm">directions_bus</span>
                              {booking.bus?.busNumber}
                            </span>
                            <span className="text-[#a6ba9c] flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-sm text-[#59f20d]">airline_seat_recline_normal</span>
                                Seats: <span className="text-white font-bold">{booking.seats?.join(', ')}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-row md:flex-col lg:flex-row gap-3 items-center">
                          <span className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg font-black border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <Link
                            to={`/customer/bookings/${booking._id}`}
                            className="bg-[#0d140a] border border-[#2e3928] text-white px-4 py-2 rounded-xl text-xs font-bold hover:border-[#59f20d] transition-all"
                          >
                            DETAILS
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-20 text-center">
                    <span className="material-symbols-outlined text-6xl text-[#2e3928] mb-4">no_travel</span>
                    <p className="text-[#a6ba9c] text-lg font-medium mb-6">No upcoming adventures planned...</p>
                    <Link to="/bus-booking" className="bg-[#59f20d] text-[#0d140a] px-8 py-3 rounded-2xl font-black shadow-[0_0_20px_rgba(89,242,13,0.3)] hover:scale-105 transition-all inline-flex items-center gap-2">
                      <span className="material-symbols-outlined font-black">explore</span>
                      START BOOKING
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Access Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Recent Activity Mini List */}
            <div className="bg-[#1c2619] border border-[#2e3928] rounded-3xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2e3928] bg-[#0d140a]/30">
                    <h2 className="text-sm font-black text-white uppercase tracking-widest">RECENT ACTIVITY</h2>
                </div>
                <div className="divide-y divide-[#2e3928]">
                    {recentBookings.length > 0 ? (
                        recentBookings.map(b => (
                            <div key={b._id} className="p-4 hover:bg-[#0d140a]/30 transition-colors flex items-center justify-between group">
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{b.bus?.route?.from} → {b.bus?.route?.to}</p>
                                    <p className="text-[10px] text-[#a6ba9c] font-black uppercase tracking-tighter opacity-60">{formatDate(b.travelDate)}</p>
                                </div>
                                <span className={`size-2 rounded-full ${getStatusColor(b.status).split(' ')[1].replace('text-', 'bg-')}`}></span>
                            </div>
                        ))
                    ) : (
                        <p className="p-6 text-center text-[#a6ba9c] text-xs">No recent history</p>
                    )}
                </div>
            </div>

            {/* Profile Settings Card */}
            <div className="bg-[#1c2619] border border-[#2e3928] rounded-3xl p-6 relative group overflow-hidden">
                <div className="absolute top-0 right-0 size-24 bg-[#59f20d]/5 rounded-bl-full blur-2xl"></div>
                
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">QUICK SETTINGS</h3>
                
                <div className="space-y-3">
                    <Link to="/customer/subscription" className="flex items-center justify-between p-4 bg-[#59f20d]/5 border border-[#59f20d]/20 rounded-2xl group/sub hover:bg-[#59f20d]/10 transition-all">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#59f20d]">bus_stop</span>
                            <div>
                                <p className="text-xs font-black text-white uppercase tracking-wider leading-none mb-1">CITY BUS PASS</p>
                                <p className="text-[10px] text-[#a6ba9c]">Renew subscriptions</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-[#59f20d] text-sm group-hover/sub:translate-x-1 transition-transform">chevron_right</span>
                    </Link>

                    <Link to="/customer/profile" className="flex items-center gap-3 p-4 bg-[#0d140a]/40 border border-[#2e3928] rounded-2xl hover:border-[#a6ba9c]/30 transition-all">
                        <span className="material-symbols-outlined text-[#a6ba9c] text-[20px]">person_edit</span>
                        <span className="text-xs font-bold text-white tracking-wide">Edit Profile</span>
                    </Link>

                    <Link to="/customer/change-password" className="flex items-center gap-3 p-4 bg-[#0d140a]/40 border border-[#2e3928] rounded-2xl hover:border-[#a6ba9c]/30 transition-all">
                        <span className="material-symbols-outlined text-[#a6ba9c] text-[20px]">lock_reset</span>
                        <span className="text-xs font-bold text-white tracking-wide">Change Password</span>
                    </Link>
                </div>

                <Link to="/customer/bookings" className="mt-8 flex items-center justify-center gap-2 w-full py-4 border-2 border-[#2e3928] rounded-2xl text-[10px] font-black tracking-[0.2em] text-[#a6ba9c] hover:bg-[#2e3928] hover:text-white transition-all uppercase">
                    View full booking logs
                </Link>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;