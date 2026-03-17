import { useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";

const KhaltiCheckoutButton = ({
    amount,
    bookingId,
    busId,
    seats,
    journeyDate,
    disabled = false,
}) => {
    const [loading, setLoading] = useState(false);

    const handleKhaltiPayment = async () => {
        setLoading(true);
        try {
            const res = await api.post("payments/khalti/initiate", {
                bookingId,
                amount,
                busId,
                seats,
                journeyDate
            });

            if (res.data?.success && res.data?.payment_url) {
                window.location.href = res.data.payment_url;
            } else {
                toast.error("Invalid response from Khalti gateway.");
            }
        } catch (error) {
            console.error("Khalti Checkout Error:", error);
            const errMsg = error.response?.data?.message || "Payment initiation failed securely.";
            toast.error(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleKhaltiPayment}
            disabled={loading || disabled}
            className={`w-full bg-[#5C2D91] text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(92,45,145,0.3)] hover:bg-[#4a2475] hover:shadow-[0_0_25px_rgba(92,45,145,0.5)] transition-all transform hover:-translate-y-0.5 flex justify-center items-center gap-2 ${(loading || disabled) ? "opacity-50 cursor-not-allowed transform-none hover:shadow-none" : ""}`}
        >
            {loading ? (
                <span className="flex items-center gap-2 text-[15px]">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Processing...
                </span>
            ) : (
                <span className="flex items-center gap-2 text-[15px]">
                    <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
                    Pay with Khalti
                </span>
            )}
        </button>
    );
};

export default KhaltiCheckoutButton;

