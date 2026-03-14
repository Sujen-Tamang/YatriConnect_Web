import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const EditProfile = () => {
    const { currentUser, updateProfile, confirmEmailUpdate } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false); // Controls if code has been sent
    const [formData, setFormData] = useState({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        phone: currentUser?.phone || ""
    });
    
    // OTP Specific State
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);
    const [error, setError] = useState("");

    // Focus first OTP input when code is sent
    useEffect(() => {
        if (otpSent && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [otpSent]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Reset OTP state if email is changed back
        if (name === "email" && value === currentUser?.email) {
            setOtpSent(false);
            setCode(["", "", "", "", "", ""]);
        }
    };

    // OTP Change Handler
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleAction = async () => {
        if (!otpSent) {
            // First click: Send Code
            if (!formData.email) return toast.error("Please enter email address");
            setLoading(true);
            try {
                const result = await updateProfile({ ...formData }); // Backend sends OTP if email changed
                if (result.success && result.otpRequired) {
                    setOtpSent(true);
                    toast.info("Verification code transmitted.");
                } else {
                    setError(result.error || "Failed to initiate verification.");
                }
            } catch (err) {
                setError("Connectivity error.");
            } finally {
                setLoading(false);
            }
        } else {
            // Second click: Verify OTP
            const verificationCode = code.join("");
            if (verificationCode.length !== 6) return setError("Enter full 6-digits.");
            setLoading(true);
            try {
                const result = await confirmEmailUpdate(verificationCode);
                if (result.success) {
                    toast.success("Email authenticated!");
                    setOtpSent(false);
                    setCode(["", "", "", "", "", ""]);
                } else {
                    setError(result.error || "Validation failed.");
                }
            } catch (err) {
                setError("Transmission failed.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.email !== currentUser?.email && !otpSent && !currentUser?.pendingEmail) {
            return toast.warning("Please verify your new email first.");
        }

        setLoading(true);
        setError("");

        try {
            const result = await updateProfile({ ...formData });
            if (result.success && !result.otpRequired) {
                toast.success("Profile records updated!");
                navigate("/customer/dashboard");
            } else if (result.otpRequired) {
                setOtpSent(true);
                toast.info("Please verify your change.");
            } else {
                setError(result.error || "Profile update failed.");
            }
        } catch (err) {
            setError("Connectivity error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0d140a] min-h-screen text-white p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[#a6ba9c] hover:text-[#59f20d] transition-colors group"
                    >
                        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Dashboard</span>
                    </button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1c2619] border border-[#2e3928] rounded-3xl p-8 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 size-40 bg-[#59f20d]/5 rounded-bl-full blur-3xl"></div>

                    <div className="relative z-10 mb-10">
                        <div className="size-16 bg-[#59f20d]/10 border border-[#59f20d]/30 rounded-2xl flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-[#59f20d] text-3xl font-black">shield_person</span>
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Edit <br /><span className="text-[#59f20d]">Profile</span></h1>
                        <p className="text-[#a6ba9c] text-xs font-semibold mt-2 opacity-60">Update your digital identity and contact records.</p>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-8 text-center"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] opacity-40 ml-4">Full Identity</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#a6ba9c] text-sm opacity-40">person</span>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-[#0d140a] border border-[#2e3928] rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all placeholder-[#a6ba9c]/20"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field with Inline OTP */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] opacity-40 ml-4">Email Address</label>
                                <div className={`relative transition-all duration-300 ${formData.email !== currentUser?.email ? 'ring-2 ring-[#59f20d]/40 rounded-2xl' : ''}`}>
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#a6ba9c] text-sm opacity-40">alternate_email</span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-[#0d140a] border border-[#2e3928] rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all placeholder-[#a6ba9c]/20"
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Verification Row */}
                            {formData.email !== currentUser?.email && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-2 px-1 flex flex-wrap items-center justify-between gap-4"
                                >
                                    <div className="flex-1 min-w-[200px]">
                                        {!otpSent ? (
                                            <p className="text-[10px] text-[#59f20d] font-black uppercase tracking-widest opacity-60">Verification sequence required</p>
                                        ) : (
                                            <div className="flex justify-start gap-2">
                                                {code.map((digit, index) => (
                                                    <input
                                                        key={index}
                                                        type="text"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                                        ref={(el) => (inputRefs.current[index] = el)}
                                                        className="size-9 bg-[#0d140a] border border-[#2e3928] rounded-lg text-white text-center text-sm font-black focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all"
                                                        placeholder="0"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <button
                                        type="button"
                                        onClick={handleAction}
                                        disabled={loading}
                                        className="bg-[#59f20d]/10 border border-[#59f20d]/30 text-[#59f20d] px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#59f20d] hover:text-[#0d140a] hover:shadow-[0_0_15px_rgba(89,242,13,0.3)] transition-all min-w-[120px]"
                                    >
                                        {loading ? "PROCESSING..." : otpSent ? "FINALIZE" : "VERIFY"}
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] opacity-40 ml-4">Phone Records</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#a6ba9c] text-sm opacity-40">call</span>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-[#0d140a] border border-[#2e3928] rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all placeholder-[#a6ba9c]/20"
                                    placeholder="+977 XXXXXXXXXX"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (formData.email !== currentUser?.email && !otpSent && !currentUser?.pendingEmail)}
                            className={`w-full font-black py-5 px-6 rounded-2xl flex items-center justify-center gap-3 text-[11px] tracking-[0.3em] transition-all mt-4 ${
                                (loading || (formData.email !== currentUser?.email && !otpSent && !currentUser?.pendingEmail))
                                ? 'bg-[#a6ba9c]/10 text-[#a6ba9c] border border-[#2e3928] cursor-not-allowed opacity-50'
                                : 'bg-[#59f20d] text-[#0d140a] hover:bg-white shadow-[0_0_20px_rgba(89,242,13,0.3)] active:scale-95'
                            }`}
                        >
                            <span className="material-symbols-outlined font-black">save</span>
                            SAVE ALL CHANGES
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default EditProfile;
