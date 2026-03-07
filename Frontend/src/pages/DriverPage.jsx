import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../utils/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const DriverPage = () => {
    const { busId } = useParams();
    const navigate = useNavigate();
    
    const [status, setStatus] = useState('offline'); // 'on-route', 'break', 'offline'
    const [isSharing, setIsSharing] = useState(false);
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const watchRef = useRef(null);

    useEffect(() => {
        socket.connect();
        
        socket.on('error', (err) => {
            toast.error(err.message);
        });

        // Listen for remote status changes if any (sync)
        socket.on('bus-status-changed', (data) => {
            if (data.busId === busId) {
                setStatus(data.status);
                if (data.status === 'offline') {
                    stopTracking();
                }
            }
        });

        return () => {
            stopTracking();
            socket.disconnect();
        };
    }, [busId]);

    const startTracking = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported');
            return;
        }

        setIsSharing(true);
        watchRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const newLoc = { lat: latitude, lng: longitude };
                setLocation(newLoc);

                // Send update to server
                socket.emit('driver-location-update', {
                    busId,
                    location: newLoc
                });
            },
            (err) => {
                toast.error('Location Access Denied');
                setIsSharing(false);
            },
            { enableHighAccuracy: true, maximumAge: 5000 }
        );
    };

    const stopTracking = () => {
        if (watchRef.current) {
            navigator.geolocation.clearWatch(watchRef.current);
            watchRef.current = null;
        }
        setIsSharing(false);
    };

    const handleShiftAction = (newStatus) => {
        // Validation: Must start tracking to go on-route
        if (newStatus === 'on-route' && !isSharing) {
            startTracking();
        }

        if (newStatus === 'offline') {
            stopTracking();
        }

        setStatus(newStatus);
        socket.emit('driver-status-update', { busId, status: newStatus });
        
        const messages = {
            'on-route': 'Shift Started: You are now LIVE',
            'break': 'Break Started: Tracking Paused',
            'offline': 'Shift Ended: Tracking Offline'
        };
        toast.info(messages[newStatus]);
    };

    return (
        <div className="min-h-screen bg-[#0d140a] text-white font-sans selection:bg-[#59f20d] selection:text-black">
            <ToastContainer theme="dark" />
            
            {/* Header */}
            <header className="border-b border-[#2e3928] bg-[#1c2619]/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#59f20d]/10 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#59f20d]">steering_wheel</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-black uppercase tracking-tighter italic">Driver <span className="text-[#59f20d]">Console</span></h1>
                            <p className="text-[10px] text-[#a6ba9c] font-black uppercase tracking-widest opacity-60">Vehicle: {busId?.slice(-8)}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-md mx-auto px-6 py-10 space-y-8">
                
                {/* Status Dashboard */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${status === 'on-route' ? 'bg-[#59f20d]' : status === 'break' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    </div>

                    <div className="space-y-6 text-center">
                        <p className="text-[10px] text-[#a6ba9c] font-black uppercase tracking-[0.3em]">Operational Status</p>
                        <h2 className={`text-4xl font-black uppercase tracking-tighter ${status === 'on-route' ? 'text-[#59f20d]' : status === 'break' ? 'text-yellow-400' : 'text-white/20'}`}>
                            {status.replace('-', ' ')}
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#2e3928]">
                            <div>
                                <p className="text-[9px] text-[#a6ba9c] font-black uppercase tracking-widest opacity-40">GPS Signal</p>
                                <p className="text-xs font-bold mt-1 text-white">{isSharing ? 'Strong' : 'None'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-[#a6ba9c] font-black uppercase tracking-widest opacity-40">Network</p>
                                <p className="text-xs font-bold mt-1 text-[#59f20d]">Stable</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main Controls */}
                <div className="space-y-4">
                    <p className="text-[10px] text-[#a6ba9c] font-black uppercase tracking-[0.3em] px-2 text-center">Shift Management</p>
                    
                    <div className="grid grid-cols-1 gap-4">
                        
                        {/* Start / Resume */}
                        {(status === 'offline' || status === 'break') && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleShiftAction('on-route')}
                                className="bg-[#59f20d] text-[#0d140a] py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(89,242,13,0.2)]"
                            >
                                <span className="material-symbols-outlined font-black">play_arrow</span>
                                {status === 'offline' ? 'Start Shift' : 'Resume Route'}
                            </motion.button>
                        )}

                        {/* Break */}
                        {status === 'on-route' && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleShiftAction('break')}
                                className="bg-yellow-500/10 text-yellow-500 border-2 border-yellow-500/20 py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3"
                            >
                                <span className="material-symbols-outlined font-black">pause</span>
                                Take a Break
                            </motion.button>
                        )}

                        {/* End Shift */}
                        {status !== 'offline' && (
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleShiftAction('offline')}
                                className="bg-red-500/10 text-red-500 border-2 border-red-500/20 py-6 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3"
                            >
                                <span className="material-symbols-outlined font-black">stop</span>
                                End Shift
                            </motion.button>
                        )}

                    </div>
                </div>

                {/* Location Micro-Map Placeholder */}
                {location && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-[#1c2619] border border-[#2e3928] rounded-3xl p-6 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#59f20d]/5 rounded-2xl flex items-center justify-center border border-[#59f20d]/20">
                                <span className="material-symbols-outlined text-[#59f20d]">my_location</span>
                            </div>
                            <div>
                                <p className="text-[10px] text-[#a6ba9c] font-black uppercase tracking-widest">Current Coordinates</p>
                                <p className="text-xs font-mono font-bold text-white mt-1">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                             <div className="flex gap-1">
                                {[1,2,3,4].map(i => <div key={i} className="w-1 h-3 bg-[#59f20d] rounded-full animate-pulse" style={{animationDelay: `${i*0.1}s`}}></div>)}
                             </div>
                             <span className="text-[8px] font-black text-[#59f20d] uppercase">Tracking</span>
                        </div>
                    </motion.div>
                )}

            </main>

            {/* Footer Status */}
            <footer className="fixed bottom-0 left-0 w-full p-6 pointer-events-none">
                <div className="max-w-md mx-auto">
                    <div className="bg-[#0d140a]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-2xl">
                        <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${isSharing ? 'bg-[#59f20d] animate-pulse' : 'bg-white/10'}`}></div>
                             <span className="text-[9px] font-black uppercase text-[#a6ba9c] tracking-widest">Live Telemetry</span>
                        </div>
                        <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">v2.1.0-prod</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DriverPage;