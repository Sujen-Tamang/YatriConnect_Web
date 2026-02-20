"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getAllUsers, createUser, deleteUser } from "../../../services/adminService"
import { toast } from "react-toastify"

const Drivers = () => {
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "driver"
    })
    const [searchTerm, setSearchTerm] = useState("")

    const fetchDrivers = async () => {
        setLoading(true)
        const res = await getAllUsers()
        if (res.success) {
            // Filter only drivers for this view
            setDrivers(res.data.filter(u => u.role === 'driver'))
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchDrivers()
    }, [])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleAddDriver = () => {
        setFormData({ name: "", email: "", phone: "", password: "", role: "driver" })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const res = await createUser(formData)
        if (res.success) {
            toast.success("New driver profile established")
            setIsModalOpen(false)
            fetchDrivers()
        } else {
            toast.error(res.message)
        }
        setLoading(false)
    }

    const handleDelete = async (id) => {
        if (window.confirm("Remove driver from roster? Access will be revoked.")) {
            const res = await deleteUser(id)
            if (res.success) {
                toast.success("Driver profile decommissioned")
                fetchDrivers()
            }
        }
    }

    const filteredDrivers = drivers.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading && drivers.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#59f20d]"></div>
                <p className="text-[#a6ba9c] text-xs font-black uppercase tracking-widest animate-pulse">Syncing Personnel...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-2">Fleet <br/>Personnel</h2>
                    <p className="text-[#a6ba9c] text-xs font-semibold opacity-60">Manage your driver roster and assign dedicated security roles.</p>
                </div>
                <button onClick={handleAddDriver} className="bg-[#59f20d] text-[#0d140a] px-8 py-4 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-[0_0_20px_rgba(89,242,13,0.2)] hover:bg-white active:scale-95">Induct New Driver</button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Search roster by identity..."
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
                                {["Identity", "Contact", "Authentication State", "Deployment", "Actions"].map((h) => (
                                    <th key={h} className="px-8 py-5 text-left text-[9px] font-black text-[#a6ba9c] uppercase tracking-[0.3em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2e3928]/40">
                            {filteredDrivers.map((driver) => (
                                <tr key={driver._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 bg-[#59f20d]/10 rounded-xl flex items-center justify-center border border-[#59f20d]/20">
                                                <span className="material-symbols-outlined text-[#59f20d] text-base">person</span>
                                            </div>
                                            <span className="text-xs font-black text-white uppercase">{driver.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-black text-white uppercase tracking-wider">{driver.email}</span>
                                            <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40">{driver.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${driver.isVerified ? 'bg-[#59f20d]/10 text-[#59f20d] border-[#59f20d]/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'}`}>
                                            {driver.isVerified ? 'Synchronized' : 'Pending Sync'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-[0.2em] opacity-40">Available for Assignment</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button onClick={() => handleDelete(driver._id)} className="text-[10px] font-black uppercase tracking-widest text-[#a6ba9c] hover:text-red-500 transition-colors">Revoke Access</button>
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
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-[#1c2619] border border-[#2e3928] rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl p-10 md:p-12">
                            <h3 className="text-white text-3xl font-black uppercase tracking-tighter mb-10 leading-none">Induct <br/><span className="text-[#59f20d]">New Personnel</span></h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest ml-1 opacity-60">Full Identity</label>
                                    <input name="name" value={formData.name} onChange={handleInputChange} required placeholder="Full Name" className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest ml-1 opacity-60">Contact Email</label>
                                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} required placeholder="email@driver.com" className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest ml-1 opacity-60">Phone Number</label>
                                        <input name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="+977 XXXXXXXXXX" className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest ml-1 opacity-60">Access Secret (Password)</label>
                                    <input name="password" type="password" value={formData.password} onChange={handleInputChange} required placeholder="Minimum 8 characters" className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none" />
                                </div>
                                <div className="pt-8 flex gap-4">
                                    <button type="submit" disabled={loading} className="flex-1 bg-[#59f20d] text-[#0d140a] font-black py-5 rounded-2xl text-[10px] tracking-[0.4em] uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(89,242,13,0.3)]">Establish Profile</button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 bg-[#2e3928] text-white font-black py-5 rounded-2xl text-[10px] tracking-[0.4em] uppercase transition-all">Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Drivers
