"use client"

import { useState, useEffect } from "react"
import { getAllUsers, updateUser, deleteUser } from "../../../services/adminService"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"

const Users = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [sortConfig, setSortConfig] = useState({ key: "joinDate", direction: "desc" })
    const [viewUserDetails, setViewUserDetails] = useState(null)

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            try {
                const response = await getAllUsers()
                if (response.success && response.data) {
                    const formattedUsers = response.data.map(user => ({
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone || 'N/A',
                        joinDate: new Date(user.createdAt).toISOString().split('T')[0],
                        isVerified: user.isVerified,
                        verificationStatus: user.isVerified ? 'Verified' : 'Unverified',
                        role: user.role,
                        bookingsCount: 0
                    }))
                    setUsers(formattedUsers)
                } else {
                    toast.error('Failed to fetch users')
                }
            } catch (error) {
                toast.error('Error fetching users')
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    const handleSort = (key) => {
        let direction = "asc"
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc"
        }
        setSortConfig({ key, direction })
    }

    const sortedUsers = [...users].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
    })

    const filteredUsers = sortedUsers.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.phone.includes(searchTerm)

        if (filterStatus === "all") return matchesSearch
        const isVerified = filterStatus === "Verified"
        return matchesSearch && user.isVerified === isVerified
    })

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#59f20d]"></div>
                <p className="text-[#a6ba9c] text-xs font-black uppercase tracking-widest animate-pulse">Loading Users...</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-2">User <br/>Management</h2>
                    <p className="text-[#a6ba9c] text-xs font-semibold opacity-60">Manage all registered passengers and administrators.</p>
                </div>
                <div className="text-[10px] font-black text-[#59f20d] uppercase tracking-[0.3em] bg-[#59f20d]/10 px-4 py-2 border border-[#59f20d]/20 rounded-full">
                    {users.length} Users Total
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#a6ba9c] opacity-40 group-focus-within:text-[#59f20d] group-focus-within:opacity-100 transition-all text-lg">search</span>
                    <input
                        type="search"
                        className="w-full bg-[#1c2619] border border-[#2e3928] rounded-2xl py-4 pl-12 pr-6 text-white text-xs placeholder-[#a6ba9c]/20 focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-56">
                    <select
                        className="w-full bg-[#1c2619] border border-[#2e3928] rounded-2xl py-4 px-5 text-white text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all cursor-pointer"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">Status: ALL</option>
                        <option value="Verified">Verified Only</option>
                        <option value="Not Verified">Unverified Only</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl"
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="text-left">
                            <tr className="bg-[#0d140a]/40 border-b border-[#2e3928]">
                                {["User", "Email & Phone", "Joined Date", "Status", "Role", "Bookings", "Action"].map((h, i) => (
                                    <th 
                                        key={h} 
                                        className={`px-8 py-5 text-left text-[9px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] ${i === 2 || i === 0 ? 'cursor-pointer hover:text-[#59f20d]' : ''}`}
                                        onClick={() => (h === "User" ? handleSort("name") : h === "Joined Date" ? handleSort("joinDate") : null)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {h}
                                            {(sortConfig.key === "name" && h === "User") || (sortConfig.key === "joinDate" && h === "Joined Date") ? (
                                                <span className="material-symbols-outlined text-[10px]">{sortConfig.direction === "asc" ? "arrow_upward" : "arrow_downward"}</span>
                                            ) : null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2e3928]/40">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-[#59f20d]/10 border border-[#59f20d]/30 flex items-center justify-center text-[#59f20d] font-black text-xs">
                                                {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                            </div>
                                            <span className="text-xs font-black text-white">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-white/80 font-medium">{user.email}</span>
                                            <span className="text-[9px] text-[#a6ba9c] font-black uppercase tracking-widest mt-1 opacity-60 italic">{user.phone}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-[10px] text-[#a6ba9c] font-black uppercase tracking-widest">{user.joinDate}</td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${user.isVerified ? 'bg-[#59f20d]/10 text-[#59f20d] border-[#59f20d]/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                                            {user.isVerified ? "Verified" : "Unverified"}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-[#59f20d]' : 'text-[#a6ba9c]'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-black text-white">{user.bookingsCount || 0}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => setViewUserDetails(user)}
                                            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a6ba9c] hover:text-[#59f20d] transition-colors"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-8 py-20 text-center text-[#a6ba9c] text-[10px] font-black uppercase tracking-[0.4em] opacity-20 italic">
                                        No users found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* User Details Modal */}
            <AnimatePresence>
                {viewUserDetails && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0d140a]/90 backdrop-blur-sm"
                            onClick={() => setViewUserDetails(null)}
                        ></motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-[#1c2619] border border-[#2e3928] rounded-[40px] w-full max-w-lg overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                        >
                            <div className="p-8 md:p-12 text-center md:text-left">
                                <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
                                    <div className="size-16 rounded-[20px] bg-[#59f20d] flex items-center justify-center text-[#0d140a] text-xl font-black">
                                        {viewUserDetails.name.split(" ").map(n => n[0]).join("")}
                                    </div>
                                    <div>
                                        <h3 className="text-white text-2xl font-black uppercase tracking-tighter leading-none">{viewUserDetails.name}</h3>
                                        <div className={`mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${viewUserDetails.isVerified ? 'bg-[#59f20d]/10 text-[#59f20d] border-[#59f20d]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                            {viewUserDetails.verificationStatus}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-[#0d140a]/60 rounded-3xl border border-[#2e3928] space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className="material-symbols-outlined text-[#a6ba9c] text-lg opacity-40">alternate_email</span>
                                            <span className="text-xs text-white font-medium">{viewUserDetails.email}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="material-symbols-outlined text-[#a6ba9c] text-lg opacity-40">call</span>
                                            <span className="text-xs text-white font-medium">{viewUserDetails.phone}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 bg-[#0d140a]/60 rounded-3xl border border-[#2e3928]">
                                            <div className="text-[20px] font-black text-[#59f20d] mb-1">{viewUserDetails.bookingsCount}</div>
                                            <div className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40">Total Bookings</div>
                                        </div>
                                        <div className="p-6 bg-[#0d140a]/60 rounded-3xl border border-[#2e3928]">
                                            <div className="text-[20px] font-black text-white mb-1 leading-none">{viewUserDetails.joinDate.split('-')[0]}</div>
                                            <div className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40">Year Joined</div>
                                        </div>
                                    </div>

                                    <p className="text-[10px] text-[#a6ba9c] font-medium opacity-40 italic text-center">User details are stored and encrypted securely.</p>
                                </div>

                                <button
                                    onClick={() => setViewUserDetails(null)}
                                    className="w-full mt-10 bg-[#2e3928] hover:bg-[#59f20d] text-[#a6ba9c] hover:text-[#0d140a] font-black py-4 rounded-2xl text-[11px] tracking-[0.3em] transition-all uppercase"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Users