"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAdminAuth } from "../../contexts/AdminAuthContext"
import { motion, AnimatePresence } from "framer-motion"

// ── Validation helpers ────────────────────────────────────────────────────────
const validateEmail = (email) => {
    if (!email.trim()) return "Email is required."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address."
    return null
}

const validatePassword = (password) => {
    if (!password) return "Password is required."
    if (password.length < 6) return "Password must be at least 6 characters."
    return null
}

const AdminLogin = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const [serverError, setServerError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [touched, setTouched] = useState({})

    const { adminSignIn } = useAdminAuth()
    const navigate = useNavigate()

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }))
        const err = field === "email" ? validateEmail(email) : validatePassword(password)
        setErrors((prev) => ({ ...prev, [field]: err }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setServerError(null)
        setTouched({ email: true, password: true })

        const emailErr = validateEmail(email)
        const passwordErr = validatePassword(password)

        if (emailErr || passwordErr) {
            setErrors({ email: emailErr, password: passwordErr })
            return
        }

        setLoading(true)
        try {
            const result = await adminSignIn(email, password)
            if (result.success) {
                navigate("/admin/dashboard")
            } else {
                setServerError(result.error || "Login failed. Check your details.")
            }
        } catch (err) {
            setServerError("Internal system error.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0d140a] flex flex-row overflow-hidden selection:bg-[#59f20d]/30 selection:text-[#59f20d]">
            
            {/* ── Left Side: Brand Visual ── */}
            <div className="w-1/2 min-h-screen relative overflow-hidden flex items-center justify-center p-20 border-r border-[#2e3928] bg-[#0d140a]">
                {/* Background image & deep gradient overlay */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center grayscale scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d140a] via-[#0d140a]/90 to-[#59f20d]/10"></div>
                <div className="absolute inset-0 backdrop-blur-[4px]"></div>

                <div className="relative z-10 max-w-xl text-center lg:text-left">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="size-16 md:size-20 bg-[#59f20d] rounded-[24px] flex items-center justify-center mb-10 shadow-[0_0_60px_rgba(89,242,13,0.5)] mx-auto lg:mx-0"
                    >
                        <span className="material-symbols-outlined text-[#0d140a] text-4xl font-black">shield_with_heart</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-6xl xl:text-8xl font-black text-white mb-8 uppercase tracking-tighter leading-[0.9] flex flex-col"
                    >
                        Admin <span className="text-[#59f20d]">Portal.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-[#a6ba9c] opacity-60 leading-relaxed font-medium"
                    >
                        Management Terminal. <br/>
                        Login to manage network operations.
                    </motion.p>
                </div>

                <div className="absolute bottom-12 left-20 flex gap-12 text-[10px] font-black text-[#59f20d] uppercase tracking-[0.4em] opacity-40">
                    <span>ADMIN v3.0</span>
                    <span className="text-white">ENCRYPTED</span>
                </div>
            </div>

            {/* ── Right Side: Form ── */}
            <div className="w-1/2 min-h-screen bg-[#0d140a] relative flex items-center justify-center p-4 md:p-20 overflow-y-auto">
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
                    <div className="absolute -top-[10%] -right-[10%] size-[60vw] bg-[#59f20d]/10 rounded-full blur-[140px]"></div>
                </div>

                <Link 
                    to="/" 
                    className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-3 text-[#a6ba9c] hover:text-[#59f20d] transition-colors group z-50 font-black uppercase text-[10px] tracking-[0.4em]"
                >
                    <span className="material-symbols-outlined text-lg group-hover:-translate-x-2 transition-transform">arrow_back</span>
                    Back to Portal
                </Link>

                <div className="max-w-md w-full relative z-10 py-12">
                    <div className="mb-12">
                        <h2 className="text-white text-3xl md:text-6xl font-black mb-4 tracking-tighter uppercase leading-none">Admin <br/>Login.</h2>
                        <p className="text-[#a6ba9c] text-sm font-medium opacity-60">Authentication required for system access.</p>
                    </div>

                    <AnimatePresence>
                        {serverError && (
                            <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-red-500/10 border border-red-500/30 text-red-500 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-10 text-center"
                            >
                                {serverError}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] ml-1 opacity-70">Admin Email</label>
                            <input
                                type="email"
                                className={`w-full bg-[#1c2619]/40 border ${errors.email && touched.email ? 'border-red-500/50' : 'border-[#2e3928]'} rounded-2xl p-4 md:p-5 text-white placeholder-[#a6ba9c]/20 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all`}
                                placeholder="Enter admin email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => handleBlur("email")}
                                required
                            />
                            {errors.email && touched.email && <p className="text-[9px] text-red-500 font-black uppercase tracking-widest ml-1">{errors.email}</p>}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] ml-1 opacity-70">Password</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`w-full bg-[#1c2619]/40 border ${errors.password && touched.password ? 'border-red-500/50' : 'border-[#2e3928]'} rounded-2xl p-4 md:p-5 text-white placeholder-[#a6ba9c]/20 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all pr-12`}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={() => handleBlur("password")}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-[#a6ba9c]/20 hover:text-[#59f20d] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                            {errors.password && touched.password && <p className="text-[9px] text-red-500 font-black uppercase tracking-widest ml-1">{errors.password}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#59f20d] text-[#0d140a] font-black py-4 md:py-5 px-8 rounded-2xl flex items-center justify-center gap-4 text-[12px] tracking-[0.4em] hover:bg-white shadow-[0_0_30px_rgba(89,242,13,0.3)] active:scale-95 transition-all mt-8"
                        >
                            {loading ? (
                                <div className="size-5 border-2 border-[#0d140a] border-t-transparent animate-spin rounded-full"></div>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-16 text-center">
                        <Link to="/auth/signin" className="text-[#a6ba9c] hover:text-[#59f20d] font-black uppercase tracking-[0.4em] text-[10px] transition-colors">
                            Return to User Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminLogin