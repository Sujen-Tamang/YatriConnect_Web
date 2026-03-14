import React, { useState, useEffect } from 'react';
import { socket } from '../utils/socket';
import LiveMap from '../components/Map/LiveMap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserPage = () => {
    const [buses, setBuses] = useState({});
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            socket.auth = { token };
        }
        
        socket.connect();

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('request-buses');
        });

        socket.on('bus-location-update', ({ busId, location }) => {
            if (location.status === 'offline') {
                setBuses(prev => {
                    const newBuses = { ...prev };
                    delete newBuses[busId];
                    return newBuses;
                });
                return;
            }
            setBuses(prev => ({ ...prev, [busId]: { ...prev[busId], ...location } }));
        });

        socket.on('active-buses', (data) => {
            setBuses(data);
        });

        socket.on('bus-status-changed', ({ busId, status, active }) => {
            if (!active) {
                setBuses(prev => {
                    const newBuses = { ...prev };
                    delete newBuses[busId];
                    return newBuses;
                });
            } else {
                setBuses(prev => ({
                    ...prev,
                    [busId]: { ...prev[busId], status }
                }));
            }
        });

        socket.on('bus-deactivated', ({ busId }) => {
            setBuses(prev => {
                const newBuses = { ...prev };
                delete newBuses[busId];
                return newBuses;
            });
        });

        return () => {
            socket.off('bus-location-update');
            socket.off('active-buses');
            socket.off('bus-status-changed');
            socket.off('bus-deactivated');
            socket.disconnect();
        };
    }, []);

    return (
        <div className="min-h-screen bg-[#0d140a] flex flex-col py-10 px-4">
            <ToastContainer />

            <div className="max-w-6xl w-full mx-auto space-y-6 flex-1 flex flex-col">

                {/* Header Section */}
                <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="size-11 bg-[#59f20d]/10 rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#59f20d] text-2xl">location_searching</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Fleet Tracking Console</h1>
                            <p className="text-[#a6ba9c] text-sm mt-0.5">Real-time geospatial monitoring of the YatriConnect fleet.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-[#6b7280] uppercase tracking-wider">System Status:</span>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 border shadow-lg ${isConnected ? 'bg-[#59f20d]/10 text-[#59f20d] border-[#59f20d]/20' : 'bg-red-900/30 text-red-400 border-red-500/20'}`}>
                            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#59f20d] animate-pulse' : 'bg-red-500'}`}></div>
                            {isConnected ? 'LIVE' : 'OFFLINE'}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">

                    {/* Left Column: Active Fleet List */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl flex-1 flex flex-col shadow-2xl overflow-hidden">
                            <div className="p-5 border-b border-[#2e3928] flex justify-between items-center bg-[#1c2619]/50">
                                <h3 className="text-sm font-black text-[#a6ba9c] uppercase tracking-widest">Active Units</h3>
                                <span className="bg-[#59f20d]/10 text-[#59f20d] px-3 py-1 rounded-full font-black text-xs border border-[#59f20d]/20">
                                    {Object.keys(buses).length}
                                </span>
                            </div>

                            <div className="p-4 flex-1 overflow-auto custom-scrollbar">
                                {Object.keys(buses).length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-[#4a5544] p-8 text-center space-y-4">
                                        <div className="size-16 rounded-full border-2 border-dashed border-[#2e3928] flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl opacity-20">sensors_off</span>
                                        </div>
                                        <p className="text-xs font-medium max-w-[150px]">Waiting for active signals from the fleet...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {Object.entries(buses).map(([busId, data]) => (
                                            <div key={busId} className="bg-[#0d140a] border border-[#2e3928] rounded-xl p-4 hover:border-[#59f20d]/30 transition-all group cursor-pointer relative overflow-hidden">
                                                <div className={`absolute top-0 left-0 w-1 h-full ${data.status === 'break' ? 'bg-yellow-500' : 'bg-[#59f20d]'}`}></div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-[#1c2619] rounded-lg flex items-center justify-center border border-[#2e3928]">
                                                        <span className={`material-symbols-outlined text-xl ${data.status === 'break' ? 'text-yellow-500/50' : 'text-[#59f20d]'}`}>local_shipping</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-white text-sm tracking-tight">
                                                            {data.busNumber || `UNIT-${busId.slice(-4).toUpperCase()}`}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'break' ? 'bg-yellow-500' : 'bg-[#59f20d]'}`}></div>
                                                            <span className={`text-[10px] font-black uppercase tracking-tighter ${data.status === 'break' ? 'text-yellow-500' : 'text-[#59f20d]'}`}>
                                                                {data.status === 'break' ? 'On Break' : 'On Route'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <span className="material-symbols-outlined text-[#2e3928] text-lg group-hover:text-[#59f20d] transition-colors">chevron_right</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: High-Resolution Tactical Map */}
                    <div className="lg:col-span-3">
                        <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl overflow-hidden h-full relative p-2 shadow-2xl">
                             <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
                                <div className="bg-[#0d140a]/80 backdrop-blur-md px-3 py-2 rounded-lg border border-[#2e3928] flex items-center gap-2">
                                    <div className="size-2 bg-[#59f20d] rounded-full shadow-[0_0_8px_#59f20d]"></div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">Satellite Lock: ACTIVE</span>
                                </div>
                             </div>
                            
                            <div className="w-full h-full rounded-xl overflow-hidden grayscale contrast-[1.1] brightness-[0.8]">
                                <LiveMap buses={buses} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UserPage;