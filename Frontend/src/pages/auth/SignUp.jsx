"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { toast, ToastContainer } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import 'react-toastify/dist/ReactToastify.css'

const SignUp = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        role: "user",
        verificationMethod: "email"
    })
    const [agreeTerms, setAgreeTerms] = useState(false)
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()
    const { signUp, signIn, loading } = useAuth()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { name, email, password, phone } = formData

        if (!name || !email || !password || !phone) {
            return setError("Please fill in all required fields")
        }

        if (!agreeTerms) {
            return setError("You must agree to the Terms and Conditions")
        }
        
        const phoneRegex = /^\d{10}$/
        if (!phoneRegex.test(phone)) {
            return setError("Phone number must be 10 digits")
        }
        
        const formattedData = {
            ...formData,
            phone: `+977${phone}`
        }

        try {
            setError("")
            setIsSubmitting(true)
            
            const registrationResult = await signUp(formattedData)
            
            if (!registrationResult.success) {
                throw new Error(registrationResult.error || "Registration failed")
            }

            const loginResult = await signIn(email, password)
            
            if (loginResult.success) {
                toast.success("Account created successfully!")
                navigate("/auth/verify", { state: { email } })
            } else {
                throw new Error(loginResult.error || "Automatic login failed")
            }
        } catch (err) {
            const msg = err.message || "Failed to create an account"
            toast.error(msg)
            setError(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0d140a] flex flex-row overflow-hidden selection:bg-[#59f20d]/30 selection:text-[#59f20d]">
            <ToastContainer />
            
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
                        <span className="material-symbols-outlined text-[#0d140a] text-3xl md:text-4xl font-black">person_add</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-6xl xl:text-8xl font-black text-white mb-8 uppercase tracking-tighter leading-[0.9] flex flex-col"
                    >
                        Join the <span className="text-[#59f20d]">Revolution.</span>
                    </motion.h1>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="hidden md:block text-xl text-[#a6ba9c] opacity-80 leading-relaxed font-medium max-w-xl"
                    >
                        The smartest way to experience Nepal. Digital passes and live tracking await you.
                    </motion.p>
                </div>
            </div>

            {/* ── Right Side: Form ── */}
            <div className="w-1/2 min-h-screen bg-[#0d140a] relative flex items-center justify-center p-4 md:p-20 overflow-y-auto">
                <div className="absolute top-0 right-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
                    <div className="absolute -top-[10%] -right-[10%] size-[60vw] bg-[#59f20d]/10 rounded-full blur-[140px]"></div>
                </div>

                <button 
                    onClick={() => navigate(-1)} 
                    className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-3 text-[#a6ba9c] hover:text-[#59f20d] transition-colors group z-50 font-black uppercase text-[8px] md:text-[10px] tracking-widest"
                >
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span>Back</span>
                </button>

                <div className="max-w-md w-full relative z-10 py-12">
                    <div className="mb-10 pt-10 lg:pt-0">
                        <h2 className="text-white text-3xl md:text-5xl font-black mb-4 tracking-tighter uppercase leading-none">Sign Up</h2>
                        <p className="text-[#a6ba9c] text-xs md:text-sm font-medium opacity-60 italic">Please fill in your details to create an account.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.2em] ml-1 opacity-70">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="w-full bg-[#1c2619]/40 border border-[#2e3928] rounded-2xl p-4 md:p-5 text-white placeholder-[#a6ba9c]/20 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Email Address */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.2em] ml-1 opacity-70">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="w-full bg-[#1c2619]/40 border border-[#2e3928] rounded-2xl p-4 md:p-5 text-white placeholder-[#a6ba9c]/20 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.2em] ml-1 opacity-70">Phone Number</label>
                                <div className="relative group flex">
                                    <div className="h-12 md:h-[62px] flex items-center justify-center bg-[#1c2619]/40 border border-[#2e3928] rounded-l-2xl px-4 md:px-5 text-[#59f20d] font-black text-xs md:text-sm tracking-widest border-r-0">
                                        +977
                                    </div>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="flex-1 bg-[#1c2619]/40 border border-[#2e3928] rounded-r-2xl p-4 md:p-5 text-white placeholder-[#a6ba9c]/20 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all"
                                        placeholder="Enter phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        maxLength="10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.2em] ml-1 opacity-70">Password</label>
                                <div className="relative group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        className="w-full bg-[#1c2619]/40 border border-[#2e3928] rounded-2xl p-4 md:p-5 text-white placeholder-[#a6ba9c]/20 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all pr-12"
                                        placeholder="Min 8 characters"
                                        value={formData.password}
                                        onChange={handleChange}
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
                        </div>

                        <div className="flex items-start gap-4 p-1">
                            <input
                                type="checkbox"
                                id="agreeTerms"
                                className="size-4 bg-[#0d140a] border-[#2e3928] rounded-md text-[#59f20d]"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                required
                            />
                            <label htmlFor="agreeTerms" className="text-[9px] text-[#a6ba9c] font-bold uppercase tracking-widest opacity-50 select-none leading-relaxed">
                                I agree to the <span className="text-[#59f20d]">Terms and Conditions</span>.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || loading}
                            className="w-full bg-[#59f20d] text-[#0d140a] font-black py-4 md:py-5 px-8 rounded-2xl flex items-center justify-center gap-4 text-[11px] tracking-[0.3em] hover:bg-[#4ed40b] shadow-[0_0_30px_rgba(89,242,13,0.4)] active:scale-95 transition-all mt-4"
                        >
                            {isSubmitting ? (
                                <div className="size-5 border-2 border-[#0d140a] border-t-transparent animate-spin rounded-full"></div>
                            ) : (
                                "Sign Up"
                            )}
                        </button>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[#a6ba9c] text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">Already have an account?</p>
                        <Link to="/auth/signin" className="text-[#59f20d] hover:text-white font-black uppercase tracking-[0.4em] text-[12px]">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp