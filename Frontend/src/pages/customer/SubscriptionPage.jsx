import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { initiateSubscription, verifySubscription, getMySubscription } from '../../../services/subscription';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

const SubscriptionPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    const checkKhaltiPayment = async () => {
        const pidx = searchParams.get('pidx');
        const sub_id = searchParams.get('purchase_order_id') || searchParams.get('sub_id');

        if (pidx && sub_id) {
            setProcessing(true);
            try {
                const res = await verifySubscription(pidx, sub_id);
                if (res.success) {
                    toast.success('Subscription activated successfully!');
                    setSearchParams({});
                    fetchSubscription();
                } else {
                    toast.error('Payment verification failed.');
                }
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error verifying payment');
            } finally {
                setProcessing(false);
            }
        }
    };

    const fetchSubscription = async () => {
        setLoading(true);
        try {
            const res = await getMySubscription();
            if (res.success && res.data) {
                setSubscription(res.data);
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkKhaltiPayment();
        fetchSubscription();
    }, []);

    const handleSubscribe = async (planType) => {
        setProcessing(true);
        console.log(`Initiating subscription for ${planType}...`);
        try {
            const res = await initiateSubscription(planType);
            console.log("Subscription initiated:", res);
            if (res.success && res.paymentUrl) {
                window.location.href = res.paymentUrl; // Redirect to Khalti
            } else {
                toast.error("Failed to get payment URL from server");
                setProcessing(false);
            }
        } catch (error) {
            console.error("Subscription Error:", error);
            const errMsg = error.response?.data?.message || error.message || 'Failed to initiate payment';
            toast.error(errMsg);
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0d140a] flex items-center justify-center">
                <div className="size-12 border-2 border-[#59f20d] border-t-transparent animate-spin rounded-full"></div>
            </div>
        );
    }

    const isActive = subscription && subscription.status === 'active' && new Date(subscription.endDate) > new Date();

    const plans = [
        {
            type: 'weekly',
            title: 'Weekly Pass',
            price: 500,
            duration: '7 Days',
            features: ['Unlimited City Bus rides', 'Valid for 7 days', 'Digital pass in Dashboard', 'Priority support'],
            highlight: false
        },
        {
            type: 'monthly',
            title: 'Monthly Pass',
            price: 1500,
            duration: '30 Days',
            features: ['Everything in Weekly', 'Valid for 30 days', 'Family discount eligibility', 'Monthly ride reports'],
            highlight: true
        },
        {
            type: 'yearly',
            title: 'Yearly Pass',
            price: 15000,
            duration: '365 Days',
            features: ['Best Value (Save 20%)', 'Valid for 365 days', 'Exclusive Yatri perks', 'Free event shuttle access'],
            highlight: false
        }
    ];

    return (
        <div className="min-h-screen bg-[#0d140a] selection:bg-[#59f20d]/30 selection:text-[#59f20d] py-12 px-4">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                
                {/* Back Button */}
                <Link 
                    to="/customer/dashboard"
                    className="flex items-center gap-2 text-[#a6ba9c] hover:text-white mb-10 group transition-colors inline-flex"
                >
                    <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
                </Link>

                {/* Hero section */}
                <div className="text-center mb-16">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight"
                    >
                        City Bus <span className="text-[#59f20d]">Subscriptions</span>
                    </motion.h1>
                    <p className="text-[#a6ba9c] max-w-2xl mx-auto text-lg">
                        Simplify your daily commute. One pass, unlimited rides, zero hassle. 
                        Choose a plan that fits your lifestyle.
                    </p>
                </div>

                {/* Active Subscription Status */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl mx-auto bg-[#1c2619] border-2 border-[#59f20d]/30 rounded-3xl p-8 mb-16 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-[#59f20d] text-[#0d140a] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">ACTIVE PASS</span>
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="size-20 bg-[#59f20d]/10 border border-[#59f20d]/30 rounded-2xl flex items-center justify-center text-[#59f20d]">
                                    <span className="material-symbols-outlined text-4xl">confirmation_number</span>
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">Your {subscription.planType} Pass</h2>
                                    <p className="text-[#59f20d] font-bold text-sm mb-2 uppercase tracking-widest">Valid until {new Date(subscription.endDate).toLocaleDateString()}</p>
                                    <p className="text-[#a6ba9c] text-sm">You have unlimited access to all CityBus routes in YatriConnect.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.type}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className={`relative bg-[#1c2619] border ${plan.highlight ? 'border-[#59f20d] scale-105 z-10' : 'border-[#2e3928]'} rounded-3xl p-8 flex flex-col hover:border-[#59f20d]/50 transition-all shadow-2xl overflow-hidden`}
                        >
                            {plan.highlight && (
                                <div className="absolute top-0 left-0 right-0 bg-[#59f20d] text-[#0d140a] text-center text-[10px] font-black py-1 uppercase tracking-[0.2em]">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-white font-black text-xl mb-1 uppercase tracking-wider">{plan.title}</h3>
                                <p className="text-[#a6ba9c] text-xs font-bold uppercase tracking-widest opacity-60">{plan.duration}</p>
                            </div>

                            <div className="mb-10">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[#59f20d] text-4xl font-black">NPR {plan.price}</span>
                                    <span className="text-[#a6ba9c] text-sm italic">/{plan.type === 'weekly' ? 'week' : plan.type === 'monthly' ? 'month' : 'year'}</span>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 flex-1">
                                {plan.features.map(feat => (
                                    <div key={feat} className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-[#59f20d] text-sm">check_circle</span>
                                        <span className="text-[#a6ba9c] text-sm leading-tight">{feat}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSubscribe(plan.type)}
                                disabled={processing}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-black uppercase text-sm tracking-widest ${
                                    plan.highlight 
                                    ? 'bg-[#59f20d] text-[#0d140a] hover:bg-[#4ed40b] shadow-[0_0_20px_rgba(89,242,13,0.3)]' 
                                    : 'bg-[#5C2D91] text-white hover:bg-[#4a2475]'
                                } shadow-xl disabled:opacity-50 active:scale-95`}
                            >
                                {processing ? (
                                    <div className="size-5 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px] font-black">wallet</span>
                                        PAY WITH KHALTI
                                    </>
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-20 text-center max-w-2xl mx-auto">
                    <div className="size-12 bg-[#1c2619] border border-[#2e3928] rounded-2xl flex items-center justify-center text-[#a6ba9c] mx-auto mb-6">
                        <span className="material-symbols-outlined">verified_user</span>
                    </div>
                    <h4 className="text-white font-bold mb-2 uppercase tracking-widest">Secure Payments</h4>
                    <p className="text-[#a6ba9c] text-sm italic opacity-60">
                        All payments are securely handled via Khalti. Your pass will be automatically activated immediately after a successful transaction.
                    </p>
                </div>

            </div>

            {/* Background decorative blur */}
            <div className="fixed -bottom-48 -left-48 size-[500px] bg-[#59f20d]/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        </div>
    );
};

export default SubscriptionPage;
