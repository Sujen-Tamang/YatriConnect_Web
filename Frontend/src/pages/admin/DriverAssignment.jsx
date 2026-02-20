"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAllRoutes, getAllUsers, assignDriver, getAllCityBuses, assignCityBusDriver } from "../../../services/adminService"
import { toast } from "react-toastify"

const DriverAssignment = () => {
    const [activeTab, setActiveTab] = useState("intercity") // 'intercity' | 'city'
    const [intercityRoutes, setIntercityRoutes] = useState([])
    const [cityBuses, setCityBuses] = useState([])
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    const fetchData = async () => {
        setLoading(true)
        try {
            const [routeRes, cityBusRes, userRes] = await Promise.all([
                getAllRoutes(), 
                getAllCityBuses(),
                getAllUsers()
            ])
            if (routeRes.success) setIntercityRoutes(routeRes.data)
            if (cityBusRes.success) setCityBuses(cityBusRes.data)
            if (userRes.success) setDrivers(userRes.data.filter(u => u.role === 'driver'))
        } catch (error) {
            toast.error("Error fetching assignment data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleAssignIntercity = async (routeId, driverId) => {
        if (!driverId) return;
        setLoading(true)
        const res = await assignDriver(routeId, driverId)
        if (res.success) {
            toast.success("Strategic deployment successful")
            fetchData()
        } else {
            toast.error(res.message)
        }
        setLoading(false)
    }

    const handleAssignCityBus = async (busId, driverId) => {
        if (!driverId) return;
        setLoading(true)
        const res = await assignCityBusDriver(busId, driverId)
        if (res.success) {
            toast.success("City personnel deployment successful")
            fetchData()
        } else {
            toast.error(res.message)
        }
        setLoading(false)
    }

    const getFilteredIntercity = () => {
        return intercityRoutes.filter(r => 
            r.from.toLowerCase().includes(searchTerm.toLowerCase()) || 
            r.to.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }

    const getFilteredCityBuses = () => {
        return cityBuses.filter(b => 
            b.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (b.route && b.route.from && b.route.from.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (b.route && b.route.to && b.route.to.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    }

    if (loading && intercityRoutes.length === 0 && cityBuses.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#59f20d]"></div>
                <p className="text-[#a6ba9c] text-xs font-black uppercase tracking-widest animate-pulse">Establishing Command Grid...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-2">Driver <br/>Assignment</h2>
                    <p className="text-[#a6ba9c] text-xs font-semibold opacity-60">Deploy certified personnel to active transit routes.</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex bg-[#1c2619] border border-[#2e3928] p-1 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('intercity')}
                        className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${
                            activeTab === 'intercity' ? 'bg-[#59f20d] text-[#0d140a]' : 'text-[#a6ba9c] hover:text-white'
                        }`}
                    >
                        Intercity Routes
                    </button>
                    <button
                        onClick={() => setActiveTab('city')}
                        className={`px-6 py-3 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${
                            activeTab === 'city' ? 'bg-[#59f20d] text-[#0d140a]' : 'text-[#a6ba9c] hover:text-white'
                        }`}
                    >
                        City Routes
                    </button>
                </div>
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search routes for deployment..."
                        className="w-full bg-[#1c2619] border border-[#2e3928] rounded-2xl px-6 py-4 text-white text-[10px] font-black tracking-widest uppercase focus:border-[#59f20d] outline-none transition-all placeholder-white/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-[#0d140a]/40 border-b border-[#2e3928]">
                                {["Active Route", "Assigned Vehicle", "Current Operator", "Deployment Action"].map((h) => (
                                    <th key={h} className="px-8 py-5 text-left text-[9px] font-black text-[#a6ba9c] uppercase tracking-[0.3em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2e3928]/40">
                            <AnimatePresence mode="wait">
                                {activeTab === 'intercity' && getFilteredIntercity().map((route) => (
                                    <motion.tr 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        key={`intercity-${route._id}`} 
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-black text-white uppercase">{route.from} ➔ {route.to}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-black text-[#59f20d] uppercase tracking-widest">#{route.bus?.busNumber || 'N/A'}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            {route.driver ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 bg-[#59f20d]/10 rounded-lg flex items-center justify-center border border-[#59f20d]/30">
                                                        <span className="material-symbols-outlined text-[#59f20d] text-sm">person</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">{route.driver.name}</span>
                                                        <span className="text-[8px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40">{route.driver.phone}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest opacity-40">Unmanned</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <select
                                                onChange={(e) => handleAssignIntercity(route._id, e.target.value)}
                                                value={route.driver?._id || ""}
                                                className="bg-[#0d140a]/60 border border-[#2e3928] rounded-xl px-4 py-2 text-[10px] font-black text-[#59f20d] uppercase tracking-widest outline-none focus:border-[#59f20d] transition-all"
                                            >
                                                <option value="">Choose Personnel</option>
                                                {drivers.map(driver => (
                                                    <option key={driver._id} value={driver._id}>{driver.name} ({driver.phone})</option>
                                                ))}
                                            </select>
                                        </td>
                                    </motion.tr>
                                ))}

                                {activeTab === 'city' && getFilteredCityBuses().map((bus) => (
                                    <motion.tr 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        key={`city-${bus._id}`} 
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-8 py-5">
                                            <span className="text-xs font-black text-white uppercase">
                                                {bus.route?.from?.name || 'Unknown'} ➔ {bus.route?.to?.name || 'Unknown'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="text-[10px] font-black text-[#59f20d] uppercase tracking-widest">#{bus.busNumber || 'N/A'}</span>
                                        </td>
                                        <td className="px-8 py-5">
                                            {bus.driver ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 bg-[#59f20d]/10 rounded-lg flex items-center justify-center border border-[#59f20d]/30">
                                                        <span className="material-symbols-outlined text-[#59f20d] text-sm">person</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">{bus.driver.name}</span>
                                                        <span className="text-[8px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40">{bus.driver.phone}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest opacity-40">Unmanned</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5">
                                            <select
                                                onChange={(e) => handleAssignCityBus(bus._id, e.target.value)}
                                                value={bus.driver?._id || ""}
                                                className="bg-[#0d140a]/60 border border-[#2e3928] rounded-xl px-4 py-2 text-[10px] font-black text-[#59f20d] uppercase tracking-widest outline-none focus:border-[#59f20d] transition-all"
                                            >
                                                <option value="">Choose Personnel</option>
                                                {drivers.map(driver => (
                                                    <option key={driver._id} value={driver._id}>{driver.name} ({driver.phone})</option>
                                                ))}
                                            </select>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}

export default DriverAssignment
