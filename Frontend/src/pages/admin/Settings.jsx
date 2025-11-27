"use client"

import { useState } from "react"
import { useAdminAuth } from "../../contexts/AdminAuthContext"
import { motion, AnimatePresence } from "framer-motion"

const Settings = () => {
    const { currentAdmin } = useAdminAuth()
    const [loading, setLoading] = useState(false)
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const [passwordError, setPasswordError] = useState("")
    const [passwordSuccess, setPasswordSuccess] = useState(false)

    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        booking: true,
        payment: true,
        systemUpdates: true,
    })
    const [notificationSuccess, setNotificationSuccess] = useState(false)

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordForm({ ...passwordForm, [name]: value })
    }

    const handleNotificationChange = (e) => {
        const { name, checked } = e.target
        setNotificationSettings({ ...notificationSettings, [name]: checked })
    }

    const handlePasswordSubmit = (e) => {
        e.preventDefault()
        setPasswordError("")
        setPasswordSuccess(false)
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return setPasswordError("Passwords do not match")
        }
        if (passwordForm.newPassword.length < 8) {
            return setPasswordError("Password must be at least 8 characters")
        }
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setPasswordSuccess(true)
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        }, 800)
    }

    const handleNotificationSubmit = (e) => {
        e.preventDefault()
        setNotificationSuccess(false)
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setNotificationSuccess(true)
        }, 800)
    }

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-2">Admin <br/>Settings</h2>
                    <p className="text-[#a6ba9c] text-xs font-semibold opacity-60">Manage your account security and system preferences.</p>
                </div>
                <div className="text-[10px] font-black text-[#59f20d] uppercase tracking-[0.3em] bg-[#59f20d]/10 px-4 py-2 border border-[#59f20d]/20 rounded-full">
                    Secure Connection Active
                </div>
            </div>

            {/* Profile Overview Card */}
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl p-8"
            >
                <div className="flex items-center gap-6 mb-10">
                    <div className="size-16 rounded-[20px] bg-[#59f20d] flex items-center justify-center text-[#0d140a] text-xl font-black">
                        {currentAdmin?.name?.charAt(0) || "A"}
                    </div>
                    <div>
                        <h3 className="text-white text-2xl font-black uppercase tracking-tighter leading-none">{currentAdmin?.name || "Administrator"}</h3>
                        <p className="text-[10px] text-[#59f20d] font-black uppercase tracking-widest mt-2">{currentAdmin?.role || "Full Admin Access"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                    <div className="p-6 bg-[#0d140a]/60 border border-[#2e3928] rounded-3xl">
                        <p className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40 mb-2">Email Address</p>
                        <p className="text-xs text-white font-medium truncate">{currentAdmin?.email || "admin@yatriconnect.com"}</p>
                    </div>
                    <div className="p-6 bg-[#0d140a]/60 border border-[#2e3928] rounded-3xl">
                        <p className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40 mb-2">Access Level</p>
                        <p className="text-xs text-white font-medium uppercase">{currentAdmin?.role || "Super Admin"}</p>
                    </div>
                    <div className="p-6 bg-[#0d140a]/60 border border-[#2e3928] rounded-3xl">
                        <p className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40 mb-2">Account Status</p>
                        <p className="text-xs text-[#59f20d] font-black tracking-widest">ACTIVE</p>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Security - Password Change */}
                <motion.div 
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] p-8 shadow-2xl"
                >
                    <h3 className="text-white text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#59f20d]">lock</span>
                        Change Password
                    </h3>
                    
                    <AnimatePresence>
                        {passwordSuccess && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 bg-[#59f20d]/10 border border-[#59f20d]/30 text-[#59f20d] px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                Password updated successfully.
                            </motion.div>
                        )}
                        {passwordError && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-6 bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                {passwordError}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest ml-1 opacity-60">Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none transition-all"
                                required
                                value={passwordForm.currentPassword}
                                onChange={handlePasswordChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest ml-1 opacity-60">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none transition-all"
                                required
                                value={passwordForm.newPassword}
                                onChange={handlePasswordChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest ml-1 opacity-60">Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] outline-none transition-all"
                                required
                                value={passwordForm.confirmPassword}
                                onChange={handlePasswordChange}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#59f20d] text-[#0d140a] font-black py-4 rounded-xl text-[10px] tracking-[0.4em] uppercase hover:bg-white transition-all shadow-[0_0_20px_rgba(89,242,13,0.3)]"
                        >
                            {loading ? "Saving..." : "Update Password"}
                        </button>
                    </form>
                </motion.div>

                {/* Notifications */}
                <motion.div 
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] p-8 shadow-2xl flex flex-col"
                >
                    <h3 className="text-white text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#59f20d]">notifications</span>
                        Notification Alerts
                    </h3>

                    <AnimatePresence>
                        {notificationSuccess && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-6 bg-[#59f20d]/10 border border-[#59f20d]/30 text-[#59f20d] px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">
                                Preferences saved successfully.
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleNotificationSubmit} className="space-y-10 flex-1">
                        <div className="space-y-6">
                            <p className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] mb-4 opacity-40">Alert Channels</p>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { id: "emailNotifications", label: "Email Alerts", sub: "Receive system reports via email" },
                                    { id: "smsNotifications", label: "SMS Alerts", sub: "Receive critical booking alerts via SMS" },
                                ].map((item) => (
                                    <label key={item.id} className="flex items-center justify-between p-5 bg-[#0d140a]/40 rounded-2xl border border-[#2e3928] cursor-pointer group hover:border-[#59f20d]/30 transition-all">
                                        <div>
                                            <p className="text-xs font-black text-white uppercase group-hover:text-[#59f20d] transition-colors">{item.label}</p>
                                            <p className="text-[9px] text-[#a6ba9c] font-bold uppercase tracking-widest opacity-40 mt-1">{item.sub}</p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            name={item.id}
                                            checked={notificationSettings[item.id]}
                                            onChange={handleNotificationChange}
                                            className="size-5 accent-[#59f20d] cursor-pointer"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <p className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] mb-4 opacity-40">Activity Alerts</p>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { id: "booking", label: "Bookings" },
                                    { id: "payment", label: "Payments" },
                                    { id: "systemUpdates", label: "System Updates" },
                                ].map((item) => (
                                    <label key={item.id} className={`px-4 py-2 border rounded-full cursor-pointer transition-all ${notificationSettings[item.id] ? 'bg-[#59f20d] border-[#59f20d] text-[#0d140a] font-black' : 'border-[#2e3928] text-[#a6ba9c] font-black opacity-40'}`}>
                                        <input
                                            type="checkbox"
                                            name={item.id}
                                            checked={notificationSettings[item.id]}
                                            onChange={handleNotificationChange}
                                            className="hidden"
                                        />
                                        <span className="text-[9px] uppercase tracking-widest whitespace-nowrap">{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto pt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#1c2619] border border-[#2e3928] hover:border-[#59f20d] text-white hover:text-[#59f20d] font-black py-4 rounded-xl text-[10px] tracking-[0.4em] uppercase transition-all"
                            >
                                {loading ? "Saving..." : "Save Settings"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    )
}

export default Settings