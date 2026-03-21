import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const ChangePassword = () => {
    const { updateUserPassword } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const toggleShow = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            return setError("New passwords do not match.");
        }

        if (formData.newPassword.length < 8) {
            return setError("Password must be at least 8 characters.");
        }

        setLoading(true);
        setError("");

        try {
            const result = await updateUserPassword(formData);
            if (result.success) {
                toast.success("Password updated successfully!");
                navigate("/customer/dashboard");
            } else {
                setError(result.error || "Failed to update password.");
            }
        } catch (err) {
            setError("Connectivity error. Please try later.");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => navigate(-1);

    return (
        <div className="bg-[#0d140a] min-h-screen text-white p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={handleBack}
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
                    {/* Decorative glow */}
                    <div className="absolute top-0 right-0 size-40 bg-[#59f20d]/5 rounded-bl-full blur-3xl"></div>

                    <div className="relative z-10 mb-10 text-center">
                        <div className="size-16 bg-[#59f20d]/10 border border-[#59f20d]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-[#59f20d] text-2xl font-black">lock_reset</span>
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter">New <br/><span className="text-[#59f20d]">Credentials</span></h1>
                        <p className="text-[#a6ba9c] text-xs font-semibold mt-2 opacity-60">Establish a secure new password for your profile access.</p>
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

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Old Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] opacity-40 ml-4">Current Password</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#a6ba9c] text-sm opacity-40">key</span>
                                <input
                                    type={showPasswords.old ? "text" : "password"}
                                    name="oldPassword"
                                    value={formData.oldPassword}
                                    onChange={handleChange}
                                    className="w-full bg-[#0d140a] border border-[#2e3928] rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all placeholder-[#a6ba9c]/20"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShow('old')}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#a6ba9c] hover:text-[#59f20d] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">{showPasswords.old ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] opacity-40 ml-4">New Password</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#a6ba9c] text-sm opacity-40">lock</span>
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full bg-[#0d140a] border border-[#2e3928] rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all placeholder-[#a6ba9c]/20"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShow('new')}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#a6ba9c] hover:text-[#59f20d] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">{showPasswords.new ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.3em] opacity-40 ml-4">Confirm New</label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#a6ba9c] text-sm opacity-40">shield</span>
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-[#0d140a] border border-[#2e3928] rounded-2xl p-4 pl-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all placeholder-[#a6ba9c]/20"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => toggleShow('confirm')}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#a6ba9c] hover:text-[#59f20d] transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[18px]">{showPasswords.confirm ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#59f20d] text-[#0d140a] font-black py-5 px-6 rounded-2xl flex items-center justify-center gap-3 text-[11px] tracking-[0.3em] hover:bg-white shadow-[0_0_20px_rgba(89,242,13,0.3)] active:scale-95 transition-all mt-8"
                        >
                            {loading ? (
                                <>
                                    <div className="size-4 border-2 border-[#0d140a] border-t-transparent animate-spin rounded-full"></div>
                                    ENCRYPTING...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined font-black">lock_open</span>
                                    UPDATE PASSWORD
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ChangePassword;