"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getDashboardStats, getRecentBookings, getPopularRoutes, getAdminNotifications } from "../../../services/adminService"
import { motion } from "framer-motion"

// Stat card icon paths
const ICONS = {
    users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
    bus: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4",
    ticket: "M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z",
    money: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
}

const STAT_THEMES = [
    "from-[#59f20d]/20 to-transparent",
    "from-teal-500/10 to-transparent",
    "from-emerald-500/10 to-transparent",
    "from-lime-500/10 to-transparent",
]

const STATUS_THEMES = {
    Confirmed: "bg-[#59f20d]/10 text-[#59f20d] border-[#59f20d]/30",
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    Cancelled: "bg-red-500/10 text-red-500 border-red-500/30",
    Completed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
}

const Dashboard = () => {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState([])
    const [recentBookings, setRecentBookings] = useState([])
    const [popularRoutes, setPopularRoutes] = useState([])
    const [notifications, setNotifications] = useState([])

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const [statsRes, bookingsRes, routesRes] = await Promise.all([
                    getDashboardStats(), getRecentBookings(), getPopularRoutes(),
                ])
                if (statsRes.success) {
                    const s = statsRes.data
                    setStats([
                        { name: "Total Users", value: s.totalUsers?.toLocaleString() ?? "0", icon: "users", change: s.totalUsersChange },
                        { name: "Active Buses", value: s.activeBuses?.toLocaleString() ?? "0", icon: "bus", change: s.activeBusesChange },
                        { name: "Bookings Today", value: s.bookingsToday?.toLocaleString() ?? "0", icon: "ticket", change: s.bookingsTodayChange },
                        { name: "Monthly Revenue", value: `NPR ${s.revenueMTD?.toLocaleString() ?? "0"}`, icon: "money", change: s.revenueMTDChange },
                    ])
                }
                if (bookingsRes.success) setRecentBookings(bookingsRes.data)
                if (routesRes.success) setPopularRoutes(routesRes.data)
                
                const notifRes = await getAdminNotifications()
                if (notifRes.success) setNotifications(notifRes.data)
            } catch {
                /* silent */
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#59f20d]"></div>
                <p className="text-[#a6ba9c] text-xs font-black uppercase tracking-widest animate-pulse">Loading Dashboard...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-10">
            {/* Header / Summary */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-2">Admin <br/>Dashboard</h2>
                    <p className="text-[#a6ba9c] text-xs font-semibold opacity-60">Overview of your application performance and transit monitoring.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-[#1c2619] border border-[#2e3928] rounded-xl flex items-center gap-2">
                        <span className="size-2 bg-[#59f20d] rounded-full animate-pulse"></span>
                        <span className="text-[10px] text-white font-black uppercase tracking-widest">System Online</span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`bg-[#1c2619] border border-[#2e3928] rounded-[24px] p-6 shadow-2xl relative overflow-hidden group hover:border-[#59f20d]/30 transition-all`}
                    >
                        <div className={`absolute -bottom-10 -right-10 size-32 bg-gradient-to-br ${STAT_THEMES[i]} rounded-full blur-2xl group-hover:scale-150 transition-transform`}></div>
                        
                        <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex items-center justify-between">
                                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-[#59f20d]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ICONS[stat.icon]} />
                                    </svg>
                                </div>
                                {stat.change !== undefined && (
                                    <div className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${stat.change >= 0 ? "bg-[#59f20d]/10 text-[#59f20d]" : "bg-red-500/10 text-red-500"}`}>
                                        {stat.change >= 0 ? "+" : ""}{stat.change}%
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <h3 className="text-2xl font-black text-white leading-none whitespace-nowrap">{stat.value}</h3>
                                <p className="text-[9px] text-[#a6ba9c] font-black uppercase tracking-[0.2em] mt-3 opacity-60 group-hover:opacity-100 transition-opacity">{stat.name}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Manage Routes", to: "/admin/routes", icon: "map" },
                    { label: "Manage Buses", to: "/admin/schedules", icon: "bus_alert" },
                    { label: "Assign Drivers", to: "/admin/driver-assignment", icon: "person_pin_circle" },
                    { label: "City Bus Routes", to: "/admin/city-routes", icon: "location_city" },
                ].map((q, i) => (
                    <Link key={i} to={q.to}
                        className="bg-[#1c2619] border border-[#2e3928] rounded-2xl px-6 py-4 flex items-center justify-center gap-3 hover:bg-[#59f20d] hover:text-[#0d140a] group transition-all text-[#a6ba9c]"
                    >
                        <span className="material-symbols-outlined text-lg opacity-40 group-hover:opacity-100">{q.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{q.label}</span>
                    </Link>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Recent Bookings */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl"
                >
                    <div className="px-8 py-6 flex justify-between items-center border-b border-[#2e3928]">
                        <div>
                            <h2 className="text-white text-xl font-black uppercase tracking-tighter">Recent Bookings</h2>
                            <p className="text-[10px] text-[#a6ba9c] font-bold uppercase tracking-widest opacity-40">Latest customer bookings</p>
                        </div>
                        <Link to="/admin/bookings" className="text-[10px] text-[#59f20d] font-black uppercase tracking-[0.2em] hover:underline">View All →</Link>
                    </div>
                    
                    {recentBookings.length === 0 ? (
                        <div className="p-12 text-center text-[#a6ba9c] text-xs font-bold uppercase tracking-widest opacity-20 italic">No recent bookings</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="bg-[#0d140a]/40 border-b border-[#2e3928]">
                                        {["Customer", "Route", "Date", "Status", "Price"].map((h) => (
                                            <th key={h} className="px-8 py-4 text-left text-[9px] font-black text-[#a6ba9c] uppercase tracking-[0.3em]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#2e3928]/40">
                                    {recentBookings.map((b) => (
                                        <tr key={b.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white">{b.customer || "Guest User"}</span>
                                                    <span className="text-[8px] font-black text-[#59f20d] uppercase tracking-widest mt-1 opacity-60">Booking ID: {b.id.slice(-8)}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-xs text-[#a6ba9c] font-medium">{b.route}</td>
                                            <td className="px-8 py-5 text-[10px] text-[#a6ba9c] font-black uppercase tracking-widest">{b.date}</td>
                                            <td className="px-8 py-5">
                                                <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${STATUS_THEMES[b.status] || "bg-white/5 text-white border-white/10"}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-xs text-white font-black">NPR {b.amount?.toLocaleString() ?? b.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Popular Routes */}
                <div className="space-y-8">
                    <div className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl">
                        <div className="px-8 py-6 border-b border-[#2e3928]">
                            <h2 className="text-white text-xl font-black uppercase tracking-tighter">Popular Routes</h2>
                            <p className="text-[10px] text-[#a6ba9c] font-bold uppercase tracking-widest opacity-40">Routes with highest traffic</p>
                        </div>
                        <ul className="px-4 py-4 space-y-2">
                            {popularRoutes.length === 0 ? (
                                <li className="py-8 text-center text-[#a6ba9c] text-[10px] font-black uppercase tracking-[0.3em] opacity-20 italic">No usage data</li>
                            ) : popularRoutes.map((r, i) => (
                                <li key={i} className="px-4 py-4 flex flex-col gap-2 rounded-2xl hover:bg-white/5 transition-all group">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-widest">Route {i+1}</span>
                                        <span className="text-[10px] font-black text-[#59f20d] leading-none">NPR {r.revenue?.toLocaleString() ?? "—"}</span>
                                    </div>
                                    <span className="text-sm font-black text-white tracking-tight">{r.route}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* System Notifications */}
                    <div className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl mt-8">
                        <div className="px-8 py-6 border-b border-[#2e3928]">
                            <h2 className="text-white text-xl font-black uppercase tracking-tighter">System Alerts</h2>
                            <p className="text-[10px] text-[#a6ba9c] font-bold uppercase tracking-widest opacity-40">Recent operations log</p>
                        </div>
                        <div className="px-4 py-4 space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center text-[#a6ba9c] text-[10px] font-black uppercase tracking-[0.3em] opacity-20 italic">No alerts</div>
                            ) : notifications.map((n, i) => (
                                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col gap-1 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black text-[#59f20d] uppercase tracking-widest">{n.title}</span>
                                        <span className="text-[8px] text-[#a6ba9c] opacity-40 font-bold">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-[11px] text-white/80 font-medium leading-relaxed">{n.message}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard