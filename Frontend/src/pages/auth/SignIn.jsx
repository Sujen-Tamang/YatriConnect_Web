"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { motion, AnimatePresence } from "framer-motion"

const SignIn = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()
    const location = useLocation()
    const { signIn, currentUser, isAuthenticated, loading } = useAuth()

    const registrationMessage = location.state?.message
    const prefillEmail = location.state?.email || ""
    const from = location.state?.from || "/"

    useEffect(() => {
        if (prefillEmail) setEmail(prefillEmail)
    }, [prefillEmail])

    useEffect(() => {
        if (isAuthenticated && currentUser) {
            if (!currentUser.isVerified && currentUser.role === 'user') {
                navigate("/auth/verify", { replace: true })
            } else {
                navigate(from, { replace: true })
            }
        }
    }, [isAuthenticated, currentUser, navigate, from])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) return setError("Please fill in all fields")

        try {
            setError("")
            setIsSubmitting(true)
            const result = await signIn(email, password)
            if (!result.success) setError(result.error || "Invalid email or password")
        } catch (err) {
            console.error("Login error:", err)
            setError("Something went wrong. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0d140a] flex flex-row overflow-hidden selection:bg-[#59f20d]/30 selection:text-[#59f20d]">
            
            {/* ── Left Side: Brand Visual ── */}
            <div className="w-1/2 min-h-screen relative overflow-hidden flex items-center justify-center p-8 md:p-20 border-r border-[#2e3928]">
                {/* Background image & gradient overlay */}
                <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center grayscale scale-110"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#0d140a] via-[#0d140a]/40 to-[#59f20d]/10"></div>
                <div className="absolute inset-0 backdrop-blur-[2px]"></div>

                <div className="relative z-10 text-center lg:text-left">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="size-16 md:size-20 bg-[#59f20d] rounded-[24px] flex items-center justify-center mb-10 shadow-[0_0_50px_rgba(89,242,13,0.4)] mx-auto lg:mx-0"
                    >
                        <span className="material-symbols-outlined text-[#0d140a] text-3xl md:text-4xl font-black">directions_bus</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-6xl xl:text-8xl font-black text-white mb-8 uppercase tracking-tighter leading-[0.9] flex flex-col"
                    >
                        Welcome to <span className="text-[#59f20d]">YatriConnect.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="hidden md:block text-xl text-[#a6ba9c] opacity-80 leading-relaxed font-medium max-w-xl"
                    >
                        Connecting Nepal through a smarter, safer, and cleaner bus network. 
                    </motion.p>
                </div>

                <div className="absolute bottom-12 left-8 md:left-20 flex gap-8 text-[8px] md:text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.4em] opacity-40">
                    <span>V 2.5</span>
                    <span>© 2026 YATRICONNECT</span>
                </div>
            </div>

            {/* ── Right Side: Form ── */}
            <div className="w-1/2 min-h-screen bg-[#0d140a] relative flex items-center justify-center p-4 md:p-20 overflow-y-auto">
                
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
                    <div className="absolute -top-[10%] -right-[10%] size-[60vw] bg-[#59f20d]/10 rounded-full blur-[140px]"></div>
                </div>

                <button 
                    onClick={() => navigate(-1)} 
                    className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-[#a6ba9c] hover:text-[#59f20d] transition-colors group z-50 font-black uppercase text-[8px] md:text-[10px] tracking-widest"
                >
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span>Back</span>
                </button>

                <div className="max-w-md w-full relative z-10 py-12">
                    <div className="mb-12">
                        <h2 className="text-white text-3xl md:text-5xl font-black mb-4 tracking-tighter uppercase leading-none">Sign In</h2>
                        <p className="text-[#a6ba9c] text-xs md:text-sm font-medium opacity-60">Enter your email and password to access your account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.2em] ml-1 opacity-70">Email Address</label>
                            <input
                                type="email"
                                className="w-full bg-[#1c2619]/40 border border-[#2e3928] rounded-2xl p-4 md:p-5 text-white placeholder-[#a6ba9c]/20 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end px-1 text-[10px] font-black uppercase tracking-[0.2em]">
                                <label className="text-[#a6ba9c] opacity-70">Password</label>
                                <Link to="/auth/forgot-password" size="sm" className="text-[#59f20d]">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-[#1c2619]/40 border border-[#2e3928] rounded-2xl p-4 md:p-5 text-white placeholder-[#a6ba9c]/20 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all pr-12"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className="w-full bg-[#59f20d] text-[#0d140a] font-black py-4 md:py-5 px-8 rounded-2xl flex items-center justify-center gap-4 text-[11px] tracking-[0.3em] hover:bg-[#4ed40b] shadow-[0_0_30px_rgba(89,242,13,0.3)] active:scale-95 transition-all mt-6"
                        >
                            {isSubmitting ? (
                                <div className="size-5 border-2 border-[#0d140a] border-t-transparent animate-spin rounded-full"></div>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[#a6ba9c] text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">Don't have an account?</p>
                        <Link to="/auth/signup" className="text-[#59f20d] hover:text-white font-black uppercase tracking-[0.4em] text-[12px]">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignIn