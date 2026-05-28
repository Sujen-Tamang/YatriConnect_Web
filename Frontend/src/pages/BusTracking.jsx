import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';
import api from '../../services/api';
import { useParams } from 'react-router-dom';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const socketUrl = import.meta.env.VITE_REACT_APP_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';
const socket = io(socketUrl, {
    path: '/socket.io',
    withCredentials: true,
});

const BusTracking = () => {
    const { busId } = useParams();
    const [bus, setBus] = useState(null);
    const [position, setPosition] = useState([27.7172, 85.3240]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBus = async () => {
            try {
                const response = await api.get(`/buses/${busId}/seats`);
                if (response.data.success) {
                    setBus(response.data.data);
                    if (response.data.data.currentLocation?.lat && response.data.data.currentLocation?.lng) {
                        setPosition([response.data.data.currentLocation.lat, response.data.data.currentLocation.lng]);
                    }
                } else {
                    setError(response.data.message || 'Failed to fetch bus details');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching bus details');
            }
        };

        fetchBus();
        socket.emit('trackBus', busId);

        socket.on('busLocationUpdate', (data) => {
            if (data.busId === busId) {
                setBus((prev) => ({ ...prev, ...data }));
                setPosition([data.currentLocation.lat, data.currentLocation.lng]);
            }
        });

        socket.on('error', ({ message }) => {
            setError(message);
        });

        return () => {
            socket.off('busLocationUpdate');
            socket.off('error');
        };
    }, [busId]);

    return (
        <div className="min-h-screen bg-[#0d140a]">
            {/* Header */}
            <div className="border-b border-[#2e3928]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="size-10 bg-[#59f20d]/10 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#59f20d]">location_searching</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Live Bus Tracking</h1>
                            <p className="text-[#a6ba9c] text-sm">Real-time location updates</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {error && (
                    <div className="mb-6 bg-red-900/30 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-2">
                        <span className="material-symbols-outlined">error</span>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Bus Info Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl p-6 sticky top-24">
                            <h2 className="text-sm font-semibold text-[#a6ba9c] uppercase tracking-wider mb-4">Bus Info</h2>
                            {bus ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-[#a6ba9c]">Bus Name</p>
                                        <p className="text-white font-bold text-lg">{bus.yatayatName} <span className="text-[#a6ba9c] text-sm font-normal">({bus.busNumber})</span></p>
                                    </div>
                                    <div className="border-t border-[#2e3928] pt-4">
                                        <p className="text-xs text-[#a6ba9c] mb-1">Route</p>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#59f20d] text-base">trip_origin</span>
                                            <span className="text-white font-medium text-sm">{bus.route.from}</span>
                                        </div>
                                        <div className="ml-2.5 border-l border-dashed border-[#2e3928] h-4"></div>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[#59f20d] text-base">location_on</span>
                                            <span className="text-white font-medium text-sm">{bus.route.to}</span>
                                        </div>
                                    </div>
                                    <div className="border-t border-[#2e3928] pt-4">
                                        <p className="text-xs text-[#a6ba9c] mb-1">Available Seats</p>
                                        <p className={`text-2xl font-bold ${bus.availableSeats > 5 ? 'text-[#59f20d]' : 'text-red-400'}`}>
                                            {bus.availableSeats}
                                        </p>
                                    </div>
                                    <div className="border-t border-[#2e3928] pt-4">
                                        <p className="text-xs text-[#a6ba9c] mb-1">Last Updated</p>
                                        <p className="text-white text-sm">
                                            {bus.currentLocation?.updatedAt
                                                ? new Date(bus.currentLocation.updatedAt).toLocaleString()
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    {/* Live indicator */}
                                    <div className="bg-[#59f20d]/10 border border-[#59f20d]/20 rounded-lg px-3 py-2 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#59f20d] animate-pulse"></div>
                                        <span className="text-[#59f20d] text-xs font-medium">Live Tracking Active</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#59f20d] mb-3"></div>
                                    <p className="text-[#a6ba9c] text-sm">Loading bus info...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-3">
                        <div className="bg-[#1c2619] border border-[#2e3928] rounded-2xl overflow-hidden">
                            <div className="px-5 py-3 border-b border-[#2e3928] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#59f20d] text-lg">map</span>
                                    <span className="text-white text-sm font-medium">Live Map</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-[#a6ba9c]">
                                    <span className="material-symbols-outlined text-sm">my_location</span>
                                    {position[0].toFixed(4)}, {position[1].toFixed(4)}
                                </div>
                            </div>
                            <MapContainer
                                center={position}
                                zoom={13}
                                style={{ height: '550px', width: '100%' }}
                                className="z-0"
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                />
                                {bus?.currentLocation?.lat && bus?.currentLocation?.lng && (
                                    <Marker position={position}>
                                        <Popup>
                                            <div className="text-sm">
                                                <strong>{bus.yatayatName}</strong> ({bus.busNumber})<br />
                                                {bus.route.from} → {bus.route.to}
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusTracking;