"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"

const TwoStepVerification = () => {
    const [code, setCode] = useState(["", "", "", "", "", ""])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState("request")
    const inputRefs = useRef([])
    const { currentUser, requestUserVerification, verifyUser } = useAuth()
    const navigate = useNavigate()

    // Focus first input when verification step starts
    useEffect(() => {
        if (step === "verify" && inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [step])

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return
        const newCode = [...code]
        newCode[index] = value
        setCode(newCode)
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const verificationCode = code.join("")

        if (verificationCode.length !== 6) {
            setError("6-digit identity code required.")
            return
        }

        try {
            setError("")
            setLoading(true)
            const result = await verifyUser(verificationCode)

            if (result?.success) {
                toast.success("Identity Authenticated!")
                navigate("/customer/dashboard", { replace: true })
                const errorMsg = result?.error || "Verification sequence invalid."
                setError(errorMsg)
                setCode(["", "", "", "", "", ""])
                setTimeout(() => inputRefs.current[0]?.focus(), 100)
            }
        } catch (err) {
            setError("Transmission error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        try {
            setLoading(true)
            const result = await requestUserVerification()
            if (result?.success) {
                toast.success("New verification code transmitted!")
            } else {
                setError(result?.error || "Failed to resend code.")
            }
        } catch (err) {
            setError("Failed to resend verification code.")
        } finally {
            setLoading(false)
        }
    }

    const handleRequestCode = async () => {
        try {
            setLoading(true)
            setError("")
            const result = await requestUserVerification()

            if (result?.success) {
                setStep("verify")
                toast.success("Verification code sent!")
            } else {
                setError(result?.error || "Transmission failed.")
            }
        } catch (err) {
            setError("Failed to request verification sequence.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-10 md:p-12 relative z-10">
            <div className="mb-10 text-center">
                <div className="size-16 bg-[#59f20d]/10 border border-[#59f20d]/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-[#59f20d] text-2xl font-black">verified_user</span>
                </div>
                <h1 className="text-white text-3xl font-black mb-4 uppercase tracking-tighter">Two-Step <br/>Verification</h1>
                <p className="text-[#a6ba9c] text-xs font-semibold leading-relaxed opacity-60">
                    Secure your profile by verifying your <br/> registered identity.
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

            {step === "request" ? (
                <div className="space-y-6">
                    <p className="text-[#a6ba9c] text-xs font-semibold leading-relaxed opacity-60 text-center">
                        We'll send a 6-digit sequence to <br/> <span className="text-[#59f20d]">{currentUser?.email}</span>
                    </p>
                    <button
                        onClick={handleRequestCode}
                        disabled={loading}
                        className="w-full bg-[#59f20d] text-[#0d140a] font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-[11px] tracking-[0.3em] hover:bg-white shadow-[0_0_20px_rgba(89,242,13,0.3)] active:scale-95 transition-all mt-4"
                    >
                        {loading ? "TRANSMITTING..." : "GENERATE SEQUENCE"}
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-between gap-2">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                ref={(el) => (inputRefs.current[index] = el)}
                                className="size-12 bg-[#0d140a] border border-[#2e3928] rounded-xl text-white text-center text-lg font-black focus:outline-none focus:ring-2 focus:ring-[#59f20d]/30 focus:border-[#59f20d] transition-all"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#59f20d] text-[#0d140a] font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-[11px] tracking-[0.3em] hover:bg-white shadow-[0_0_20px_rgba(89,242,13,0.3)] active:scale-95 transition-all mt-4"
                    >
                        {loading ? "VERIFYING..." : "COMPLETE AUTH"}
                    </button>
                </form>
            )}

            <div className="mt-12 text-center flex flex-col gap-4">
                {step === "verify" ? (
                    <>
                        <button
                            onClick={handleResend}
                            className="text-[#a6ba9c] hover:text-[#59f20d] font-black text-[10px] uppercase tracking-[0.3em] transition-colors"
                            disabled={loading}
                        >
                            Resend Sequence?
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[#a6ba9c] hover:text-[#59f20d] font-black text-[10px] uppercase tracking-[0.3em] transition-colors"
                    >
                        Go Back
                    </button>
                )}
            </div>
        </div>
    )
}

export default TwoStepVerification;