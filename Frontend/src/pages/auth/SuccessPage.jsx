"use client"

import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const SuccessPage = () => {
    const navigate = useNavigate()

    return (
        <div className="p-10 md:p-12 relative z-10 text-center">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="size-20 bg-[#59f20d]/10 border border-[#59f20d]/30 rounded-full flex items-center justify-center mx-auto mb-8"
            >
                <span className="material-symbols-outlined text-[#59f20d] text-4xl font-black italic">check_circle</span>
            </motion.div>

            <h1 className="text-white text-3xl font-black mb-4 uppercase tracking-tighter">Transmission <br/>Complete</h1>
            
            <p className="text-[#a6ba9c] text-xs font-semibold leading-relaxed opacity-60 mb-10">
                A secure link has been dispatched to your <br/> registered email. Please verify your inbox <br/> to proceed with the recovery.
            </p>

            <button
                onClick={() => navigate("/auth/signin")}
                className="w-full bg-[#59f20d] text-[#0d140a] font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-[11px] tracking-[0.3em] hover:bg-white shadow-[0_0_20px_rgba(89,242,13,0.3)] active:scale-95 transition-all mt-4"
            >
                RETURN TO SIGN IN
            </button>
        </div>
    )
}

export default SuccessPage