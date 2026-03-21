"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FaMapMarkerAlt, FaEnvelope, FaPhone, FaPaperPlane } from "react-icons/fa"

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    })
    const [loading, setLoading] = useState(false)
    const [formStatus, setFormStatus] = useState({ submitted: false, success: false, message: "" })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setFormStatus({ submitted: true, success: true, message: "Thank you for your message! We'll get back to you soon." })
            setFormData({ name: "", email: "", subject: "", message: "" })
        }, 1200)
    }

    return (
        <div className="min-h-screen bg-[#0d140a] py-12 px-4 selection:bg-[#59f20d]/30 selection:text-[#59f20d]">
            <div className="max-w-6xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                        Get In <span className="text-[#59f20d]">Touch</span>
                    </h1>
                    <p className="text-[#a6ba9c] max-w-2xl mx-auto text-lg">
                        Have a question, feedback, or need assistance? Our team is here to help you navigate your journey with ease.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Contact Info Cards */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl p-6 transition-all hover:border-[#59f20d]/30 group">
                            <div className="size-12 bg-[#59f20d]/10 rounded-xl flex items-center justify-center text-[#59f20d] mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-2xl">location_on</span>
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">Our Office</h3>
                            <p className="text-[#a6ba9c] text-sm leading-relaxed">123 Yatri Marg, Kathmandu, Nepal</p>
                        </div>

                        <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl p-6 transition-all hover:border-[#59f20d]/30 group">
                            <div className="size-12 bg-[#59f20d]/10 rounded-xl flex items-center justify-center text-[#59f20d] mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-2xl">mail</span>
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">Email Us</h3>
                            <a href="mailto:support@yatrisuvidha.com" className="text-[#a6ba9c] text-sm hover:text-[#59f20d] transition-colors">support@yatrisuvidha.com</a>
                        </div>

                        <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl p-6 transition-all hover:border-[#59f20d]/30 group">
                            <div className="size-12 bg-[#59f20d]/10 rounded-xl flex items-center justify-center text-[#59f20d] mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-2xl">call</span>
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">Call Us</h3>
                            <a href="tel:+97715550123" className="text-[#a6ba9c] text-sm hover:text-[#59f20d] transition-colors">+977-1-5550123</a>
                        </div>

                    </div>

                    {/* Contact Form Container */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-8 bg-[#1c2619] border border-[#2e3928] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute -top-24 -right-24 size-48 bg-[#59f20d]/5 rounded-full blur-3xl invisible md:visible"></div>
                        
                        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#59f20d]">send</span>
                            Send us a Message
                        </h2>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-[#a6ba9c] uppercase tracking-wider mb-2 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-[#0d140a] text-white px-5 py-4 border border-[#2e3928] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59f20d]/50 focus:border-[#59f20d] transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-[#a6ba9c] uppercase tracking-wider mb-2 ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-[#0d140a] text-white px-5 py-4 border border-[#2e3928] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59f20d]/50 focus:border-[#59f20d] transition-all"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-[#a6ba9c] uppercase tracking-wider mb-2 ml-1">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full bg-[#0d140a] text-white px-5 py-4 border border-[#2e3928] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59f20d]/50 focus:border-[#59f20d] transition-all"
                                    placeholder="How can we help?"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-[#a6ba9c] uppercase tracking-wider mb-2 ml-1">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full bg-[#0d140a] text-white px-5 py-4 border border-[#2e3928] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#59f20d]/50 focus:border-[#59f20d] transition-all resize-none"
                                    placeholder="Share your thoughts with us..."
                                    required
                                ></textarea>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full bg-[#59f20d] text-[#0d140a] font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-lg hover:bg-[#4ed40b] shadow-[0_0_20px_rgba(89,242,13,0.3)] hover:shadow-[0_0_30px_rgba(89,242,13,0.5)] transition-all disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="size-6 border-2 border-[#0d140a] border-t-transparent animate-spin rounded-full"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined font-black">send</span>
                                        SEND MESSAGE
                                    </>
                                )}
                            </motion.button>

                            {formStatus.submitted && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className={`p-4 rounded-xl text-center text-sm font-medium ${formStatus.success ? "bg-[#59f20d]/10 text-[#59f20d] border border-[#59f20d]/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
                                >
                                    {formStatus.message}
                                </motion.div>
                            )}
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default ContactPage