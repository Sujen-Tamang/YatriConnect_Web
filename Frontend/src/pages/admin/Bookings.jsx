"use client"

import { useState, useEffect } from "react"
import { getAllBookings } from "../../../services/adminService"
import { motion, AnimatePresence } from "framer-motion"

const Bookings = () => {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [filterDate, setFilterDate] = useState("")
    const [sortConfig, setSortConfig] = useState({ key: "bookedAt", direction: "desc" })
    const [viewBookingDetails, setViewBookingDetails] = useState(null)

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true)
            try {
                const response = await getAllBookings()
                if (response.success && response.data) {
                    const mapped = response.data.map((b) => ({
                        bookingId: b.bookingId || b._id || '-',
                        user: {
                            userId: b.user?._id || '-',
                            fullName: b.user?.name || b.user?.fullName || '-',
                            email: b.user?.email || '-',
                            phone: b.user?.phone || '-',
                        },
                        bus: {
                            busId: b.bus?._id || '-',
                            yatayatName: b.bus?.yatayatName || '-',
                            busNumber: b.bus?.busNumber || '-',
                            departure: b.bus?.route?.from || b.bus?.departure || '-',
                            destination: b.bus?.route?.to || b.bus?.destination || '-',
                            departureDate: b.bus?.schedule?.departureDate || b.travelDate || b.date || '-',
                            departureTime: b.bus?.schedule?.departureTime || b.bus?.departureTime || '-',
                        },
                        seat: {
                            seatNumber: Array.isArray(b.seats) ? b.seats[0] : b.seatNumber || '-',
                            seatType: b.seatType || '-',
                        },
                        payment: {
                            amountPaid: b.amount || b.totalPrice || '-',
                            currency: 'NPR',
                            paymentMethod: b.paymentMethod || '-',
                            paymentStatus: b.paymentStatus || '-',
                            transactionId: b.transactionId || '-',
                        },
                        bookingStatus: b.status || b.bookingStatus || '-',
                        bookedAt: b.createdAt || '-',
                    }))
                    setBookings(mapped)
                }
            } catch (error) {
                setBookings([])
            } finally {
                setLoading(false)
            }
        }
        fetchBookings()
    }, [])

    const handleSort = (key) => {
        let direction = "asc"
        if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc"
        setSortConfig({ key, direction })
    }

    const sortedBookings = [...bookings].sort((a, b) => {
        const getValue = (obj, path) => path.split(".").reduce((o, k) => (o || {})[k], obj)
        const aValue = getValue(a, sortConfig.key)
        const bValue = getValue(b, sortConfig.key)
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
    })

    const filteredBookings = sortedBookings.filter((booking) => {
        const matchesSearch =
            booking.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${booking.bus.departure} to ${booking.bus.destination}`.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = filterStatus === "all" ? true : booking.bookingStatus === filterStatus
        const matchesDate = filterDate ? booking.bus.departureDate === filterDate : true
        return matchesSearch && matchesStatus && matchesDate
    })

    const STATUS_THEMES = {
        Confirmed: "bg-[#59f20d]/10 text-[#59f20d] border-[#59f20d]/30",
        Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
        Cancelled: "bg-red-500/10 text-red-500 border-red-500/30",
    }

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#59f20d]"></div>
                <p className="text-[#a6ba9c] text-xs font-black uppercase tracking-widest animate-pulse">Loading Bookings...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-2">Bookings <br/>Management</h2>
                    <p className="text-[#a6ba9c] text-xs font-semibold opacity-60">View and manage all ticket bookings and reservation status.</p>
                </div>
                <div className="text-[10px] font-black text-[#59f20d] uppercase tracking-[0.3em] bg-[#59f20d]/10 px-4 py-2 border border-[#59f20d]/20 rounded-full">
                    {bookings.length} Total Bookings
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative group overflow-hidden rounded-2xl border border-[#2e3928] focus-within:border-[#59f20d]/50 transition-colors bg-[#1c2619]">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#a6ba9c] opacity-40 text-lg">search</span>
                    <input
                        type="search"
                        className="w-full bg-transparent py-4 pl-12 pr-6 text-white text-xs placeholder-[#a6ba9c]/20 focus:outline-none"
                        placeholder="Search by ID, Customer, or Route..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl overflow-hidden focus-within:border-[#59f20d]/50 transition-colors">
                    <input
                        type="date"
                        className="w-full bg-transparent py-4 px-6 text-white text-[10px] font-black uppercase tracking-widest focus:outline-none custom-calendar-icon"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                    />
                </div>
                <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl overflow-hidden focus-within:border-[#59f20d]/50 transition-colors">
                    <select
                        className="w-full bg-transparent py-4 px-6 text-white text-[10px] font-black uppercase tracking-widest focus:outline-none cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Status: ALL</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Bookings Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl"
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-[#0d140a]/40 border-b border-[#2e3928]">
                                {["Booking ID", "Customer", "Route", "Travel Date", "Status", "Price", "Action"].map((h, i) => (
                                    <th 
                                        key={h} 
                                        className={`px-8 py-5 text-left text-[9px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] ${i === 0 || i === 3 || i === 5 ? 'cursor-pointer hover:text-[#59f20d]' : ''}`}
                                        onClick={() => {
                                            if (h === "Booking ID") handleSort("bookingId")
                                            if (h === "Travel Date") handleSort("bus.departureDate")
                                            if (h === "Price") handleSort("payment.amountPaid")
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            {h}
                                            {(sortConfig.key === "bookingId" && h === "Booking ID") || 
                                             (sortConfig.key === "bus.departureDate" && h === "Travel Date") || 
                                             (sortConfig.key === "payment.amountPaid" && h === "Price") ? (
                                                <span className="material-symbols-outlined text-[10px]">{sortConfig.direction === "asc" ? "arrow_upward" : "arrow_downward"}</span>
                                            ) : null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2e3928]/40">
                            {filteredBookings.map((b) => (
                                <tr key={b.bookingId} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5 font-black text-[#59f20d] text-[10px] tracking-wider">{b.bookingId.slice(-8).toUpperCase()}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-white">{b.user.fullName}</span>
                                            <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest mt-1 opacity-60">{b.user.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-white/80 font-medium">{b.bus.departure} → {b.bus.destination}</span>
                                            <span className="text-[9px] text-[#a6ba9c] font-black uppercase tracking-widest mt-1 opacity-40">{b.bus.yatayatName} • Seat {b.seat.seatNumber}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-white font-black uppercase tracking-widest">{b.bus.departureDate}</span>
                                            <span className="text-[9px] text-[#a6ba9c] font-black uppercase tracking-widest mt-1 opacity-40">{b.bus.departureTime}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${STATUS_THEMES[b.bookingStatus] || "bg-white/5 text-white border-white/10"}`}>
                                            {b.bookingStatus}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm text-white font-black">NPR {b.payment.amountPaid}</td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => setViewBookingDetails(b)}
                                            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a6ba9c] hover:text-[#59f20d] transition-colors"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-[#a6ba9c] text-[10px] font-black uppercase tracking-[0.4em] opacity-20 italic">
                                        No bookings found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Booking Details Modal */}
            <AnimatePresence>
                {viewBookingDetails && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0d140a]/90 backdrop-blur-sm"
                            onClick={() => setViewBookingDetails(null)}
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-[#1c2619] border border-[#2e3928] rounded-[40px] w-full max-w-2xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                        >
                            <div className="p-8 md:p-12">
                                <div className="flex justify-between items-start mb-10">
                                    <div>
                                        <h3 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-4">Booking <br/>Details</h3>
                                        <div className="text-[10px] font-black text-[#59f20d] uppercase tracking-widest">ID: {viewBookingDetails.bookingId}</div>
                                    </div>
                                    <span className={`text-[9px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border ${STATUS_THEMES[viewBookingDetails.bookingStatus] || "bg-white/5 text-white border-white/10"}`}>
                                        {viewBookingDetails.bookingStatus}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Primary Info */}
                                    <div className="space-y-6">
                                        <div className="p-6 bg-[#0d140a]/60 rounded-3xl border border-[#2e3928]">
                                            <p className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40 mb-4">Customer</p>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black text-white">{viewBookingDetails.user.fullName}</span>
                                                <span className="text-xs text-[#a6ba9c] font-medium">{viewBookingDetails.user.email}</span>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-[#0d140a]/60 rounded-3xl border border-[#2e3928]">
                                            <p className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40 mb-4">Route Info</p>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-black text-white">{viewBookingDetails.bus.departure} → {viewBookingDetails.bus.destination}</span>
                                                <span className="text-xs text-[#a6ba9c] font-medium">{viewBookingDetails.bus.yatayatName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metrics */}
                                    <div className="space-y-6">
                                        <div className="p-6 bg-[#0d140a]/60 rounded-3xl border border-[#2e3928]">
                                            <p className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40 mb-4">Seat Allocation</p>
                                            <div className="flex items-end gap-3">
                                                <span className="text-2xl font-black text-[#59f20d] leading-none">{viewBookingDetails.seat.seatNumber}</span>
                                                <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest mb-1 italic">[{viewBookingDetails.seat.seatType}]</span>
                                            </div>
                                        </div>
                                        <div className="p-6 bg-[#0d140a]/60 rounded-3xl border border-[#2e3928]">
                                            <p className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40 mb-4">Payment Details</p>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-black text-white">NPR {viewBookingDetails.payment.amountPaid}</span>
                                                    <span className="text-[8px] text-[#59f20d] font-black uppercase tracking-widest">{viewBookingDetails.payment.paymentMethod}</span>
                                                </div>
                                                <span className="text-[8px] text-[#a6ba9c] font-black tracking-widest opacity-30">Transaction ID: {viewBookingDetails.payment.transactionId}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => setViewBookingDetails(null)}
                                        className="flex-1 bg-[#2e3928] hover:bg-white/10 text-[#a6ba9c] hover:text-white font-black py-4 rounded-2xl text-[10px] tracking-[0.3em] transition-all uppercase"
                                    >
                                        Close
                                    </button>
                                    <button
                                        className="flex-1 bg-[#59f20d] text-[#0d140a] font-black py-4 rounded-2xl text-[10px] tracking-[0.3em] transition-all uppercase shadow-[0_0_20px_rgba(89,242,13,0.3)]"
                                        onClick={() => setViewBookingDetails(null)}
                                    >
                                        Export
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Bookings