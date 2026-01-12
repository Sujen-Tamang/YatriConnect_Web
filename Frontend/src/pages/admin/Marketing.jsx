"use client"

import { useState, useEffect } from "react"
import { sendPromo, getAdminNotifications } from "../../../services/adminService"
import { motion, AnimatePresence } from "framer-motion"

const Marketing = () => {
    const [title, setTitle] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [status, setStatus] = useState(null)

    const fetchHistory = async () => {
        const res = await getAdminNotifications()
        if (res.success) setNotifications(res.data)
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    const handleSendPromo = async (e) => {
        e.preventDefault()
        setLoading(true)
        setStatus(null)
        try {
            const res = await sendPromo({ title, message })
            if (res.success) {
                setStatus({ type: "success", text: "Promotion sent to all users!" })
                setTitle("")
                setMessage("")
                fetchHistory()
            } else {
                setStatus({ type: "error", text: res.message || "Failed to send promotion" })
            }
        } catch (error) {
            setStatus({ type: "error", text: "An unexpected error occurred" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-10 pb-10 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-2">Marketing <br/>& Outreach</h2>
                    <p className="text-[#a6ba9c] text-xs font-semibold opacity-60">Send promotional offers and system alerts to all users.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Promo Form */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] p-8 shadow-2xl"
                >
                    <div className="mb-8">
                        <h3 className="text-white text-xl font-black uppercase tracking-tighter">New Promotion</h3>
                        <p className="text-[10px] text-[#a6ba9c] font-bold uppercase tracking-widest opacity-40">Create a global notification</p>
                    </div>

                    <form onSubmit={handleSendPromo} className="space-y-6">
                        <div>
                            <label className="text-[10px] text-[#a6ba9c] font-black uppercase tracking-[0.2em] mb-2 block">Campaign Title</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Weekend Special Discount!"
                                className="w-full bg-[#0d140a] border border-[#2e3928] rounded-2xl px-5 py-4 text-white text-sm focus:border-[#59f20d] outline-none transition-all font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-[10px] text-[#a6ba9c] font-black uppercase tracking-[0.2em] mb-2 block">Message Content</label>
                            <textarea 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write your promotional message here..."
                                rows={5}
                                className="w-full bg-[#0d140a] border border-[#2e3928] rounded-2xl px-5 py-4 text-white text-sm focus:border-[#59f20d] outline-none transition-all font-medium resize-none"
                                required
                            />
                        </div>

                        <AnimatePresence>
                            {status && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${status.type === 'success' ? 'bg-[#59f20d]/10 text-[#59f20d]' : 'bg-red-500/10 text-red-500'}`}
                                >
                                    {status.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#59f20d] text-[#0d140a] font-black uppercase tracking-widest py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(89,242,13,0.2)]"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[#0d140a]"></div>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-lg">send</span>
                                    BROADCAST PROMO
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>

                {/* History */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
                >
                    <div className="px-8 py-6 border-b border-[#2e3928]">
                        <h2 className="text-white text-xl font-black uppercase tracking-tighter">Broadcast History</h2>
                        <p className="text-[10px] text-[#a6ba9c] font-bold uppercase tracking-widest opacity-40">Previously sent notifications</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px] custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="py-20 text-center text-[#a6ba9c] text-xs font-bold uppercase tracking-widest opacity-20 italic">No history found</div>
                        ) : notifications.map((n, i) => (
                            <div key={i} className={`p-5 rounded-2xl border ${n.type === 'promo' ? 'border-[#59f20d]/20 bg-[#59f20d]/5' : 'border-white/5 bg-white/2'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${n.type === 'promo' ? 'bg-[#59f20d] text-[#0d140a]' : 'bg-[#a6ba9c]/20 text-[#a6ba9c]'}`}>
                                        {n.type}
                                    </span>
                                    <span className="text-[9px] text-[#a6ba9c] font-bold">
                                        {new Date(n.createdAt).toLocaleDateString()} · {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <h4 className="text-white font-black text-sm mb-1">{n.title}</h4>
                                <p className="text-xs text-[#a6ba9c] leading-relaxed">{n.message}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default Marketing
