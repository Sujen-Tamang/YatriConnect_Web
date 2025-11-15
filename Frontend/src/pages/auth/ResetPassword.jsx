"use client"

import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"

const ResetPassword = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const { resetPassword } = useAuth()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            return setError("Passwords do not match.")
        }

        if (password.length < 6) {
            return setError("Password must be at least 6 characters.")
        }

        try {
            setError("")
            setLoading(true)
            const result = await resetPassword(token, { password, confirmPassword })

            if (result.success) {
                toast.success("Password reset successfully!")
                navigate("/auth/signin")
            } else {
                setError(result.error || "Failed to reset password.")
            }
        } catch (err) {
            setError("Connectivity error. Please try later.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-10 md:p-12 relative z-10">
            <div className="mb-10 text-center">
                <div className="size-16 bg-[#59f20d]/10 border border-[#59f20d]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-[#59f20d] text-2xl font-black">lock_open</span>
                </div>
                <h1 className="text-white text-3xl font-black mb-4 uppercase tracking-tighter">New <br/>Credentials</h1>
                <p className="text-[#a6ba9c] text-xs font-semibold leading-relaxed opacity-60">
                    Establish a secure new password <br/> for your profile access.
                </p>
            </div>

            <AnimatePresence mode="wait">
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 text-center"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2 text-center flex flex-col items-center">
                    <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] opacity-40">New Password</label>
                    <input
                        type="password"
                        className="w-full bg-[#0d140a] border border-[#2e3928] rounded-2xl p-4 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all placeholder-[#a6ba9c]/20"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2 text-center flex flex-col items-center">
                    <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] opacity-40">Confirm Password</label>
                    <input
                        type="password"
                        className="w-full bg-[#0d140a] border border-[#2e3928] rounded-2xl p-4 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all placeholder-[#a6ba9c]/20"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#59f20d] text-[#0d140a] font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-[11px] tracking-[0.3em] hover:bg-white shadow-[0_0_20px_rgba(89,242,13,0.3)] active:scale-95 transition-all mt-4"
                    disabled={loading}
                >
                    {loading ? "UPDATING..." : "RESET PASSWORD"}
                </button>
            </form>

            <div className="mt-12 text-center">
                <Link to="/auth/signin" className="text-[#a6ba9c] hover:text-[#59f20d] font-black text-[10px] uppercase tracking-[0.3em] transition-colors flex items-center justify-center gap-2 group">
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Return to Login
                </Link>
            </div>
        </div>
    )
}

export default ResetPassword
