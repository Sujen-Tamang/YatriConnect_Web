"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAllRoutes, createRoute, deleteRoute, getAllBuses } from "../../../services/adminService"
import { toast } from "react-toastify"

const Routes = () => {
  const [routes, setRoutes] = useState([])
  const [buses, setBuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    distance: "",
    duration: "",
    price: "",
    busId: "",
    schedule: { departure: "", arrival: "", frequency: "daily" },
    active: true,
  })
  const [searchTerm, setSearchTerm] = useState("")

  const fetchData = async () => {
    setLoading(true)
    try {
      const [routeRes, busRes] = await Promise.all([getAllRoutes(), getAllBuses()])
      if (routeRes.success) setRoutes(routeRes.data)
      if (busRes.success) setBuses(busRes.data)
    } catch (error) {
      toast.error("Error loading operational data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.includes(".")) {
      const [prefix, field] = name.split(".")
      setFormData(prev => ({ ...prev, [prefix]: { ...prev[prefix], [field]: value } }))
    } else {
      setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
    }
  }

  const handleAddRoute = () => {
    setFormData({ from: "", to: "", distance: "", duration: "", price: "", busId: "", schedule: { departure: "", arrival: "", frequency: "daily" }, active: true })
    setIsModalOpen(true)
  }

  const handleDeleteRoute = async (id) => {
    if (window.confirm("Delete this operational route?")) {
      const res = await deleteRoute(id)
      if (res.success) {
        toast.success("Route decommissioned")
        fetchData()
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.busId) return toast.error("Please assign a vehicle to this route")
    
    setLoading(true)
    const res = await createRoute(formData)
    if (res.success) {
      toast.success("Strategic route established")
      setIsModalOpen(false)
      fetchData()
    } else {
      toast.error(res.message)
    }
    setLoading(false)
  }

  const filteredRoutes = routes.filter((route) => 
    route.from.toLowerCase().includes(searchTerm.toLowerCase()) || 
    route.to.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading && routes.length === 0) {
    return (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#59f20d]"></div>
            <p className="text-[#a6ba9c] text-xs font-black uppercase tracking-widest animate-pulse">Synchronizing Grid...</p>
        </div>
    )
  }

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
            <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-2">Transit <br/>Management</h2>
            <p className="text-[#a6ba9c] text-xs font-semibold opacity-60">Design intercity connections and link registered fleet units.</p>
        </div>
        <button onClick={handleAddRoute} className="bg-[#59f20d] text-[#0d140a] px-8 py-4 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-[0_0_20px_rgba(89,242,13,0.2)] hover:bg-white active:scale-95">Establish New Route</button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Filter grid by location..."
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
                {["Deployment", "Vector", "Pricing", "Assigned Unit", "Personnel", "Actions"].map((h) => (
                  <th key={h} className="px-8 py-5 text-left text-[9px] font-black text-[#a6ba9c] uppercase tracking-[0.3em]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2e3928]/40">
              {filteredRoutes.map((route) => (
                <tr key={route._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5">
                    <span className="text-xs font-black text-white uppercase">{route.from} ➔ {route.to}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">{route.distance}</span>
                        <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40">{route.duration}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-[#59f20d] uppercase">NPR {route.price}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-80">#{route.bus?.busNumber || 'N/A'}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-60">{route.driver?.name || 'UNASSIGNED'}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => handleDeleteRoute(route._id)} className="text-[10px] font-black uppercase tracking-widest text-[#a6ba9c] hover:text-red-500 transition-colors">Decommission</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0d140a]/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#1c2619] border border-[#2e3928] rounded-[40px] w-full max-w-3xl overflow-hidden shadow-2xl p-10 md:p-12 h-[85vh] flex flex-col">
              <h3 className="text-white text-3xl font-black uppercase tracking-tighter mb-8 leading-none">Establish <br/><span className="text-[#59f20d]">New Vector</span></h3>
              <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto pr-4 custom-scrollbar flex-1">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-60">From</label>
                        <input name="from" value={formData.from} onChange={handleInputChange} required placeholder="Kathmandu" className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-60">To</label>
                        <input name="to" value={formData.to} onChange={handleInputChange} required placeholder="Pokhara" className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-60">Distance (KM)</label>
                        <input name="distance" value={formData.distance} onChange={handleInputChange} required placeholder="200 km" className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-60">Duration</label>
                        <input name="duration" value={formData.duration} onChange={handleInputChange} required placeholder="6h 30m" className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-60">Ticket Price (NPR)</label>
                        <input name="price" type="number" value={formData.price} onChange={handleInputChange} required placeholder="1500" className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-60">Assign Registered Vehicle</label>
                        <select name="busId" value={formData.busId} onChange={handleInputChange} required className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none h-[50px]">
                            <option value="">Select a Bus</option>
                            {buses.map(bus => (
                                <option key={bus._id} value={bus._id}>#{bus.busNumber} ({bus.yatayatName || 'Generic'})</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-60">Departure</label>
                        <input name="schedule.departure" value={formData.schedule.departure} onChange={handleInputChange} required placeholder="08:00 AM" className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-60">Arrival</label>
                        <input name="schedule.arrival" value={formData.schedule.arrival} onChange={handleInputChange} required placeholder="04:00 PM" className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-60">Frequency</label>
                        <select name="schedule.frequency" value={formData.schedule.frequency} onChange={handleInputChange} className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none h-[50px]">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>
                </div>
                <div className="pt-8 flex gap-4 sticky bottom-0 bg-[#1c2619] py-4">
                  <button type="submit" className="flex-1 bg-[#59f20d] text-[#0d140a] font-black py-5 rounded-2xl text-[10px] tracking-[0.4em] uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(89,242,13,0.3)]">Activate Route</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 bg-[#2e3928] text-white font-black py-5 rounded-2xl text-[10px] tracking-[0.4em] uppercase transition-all">Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Routes