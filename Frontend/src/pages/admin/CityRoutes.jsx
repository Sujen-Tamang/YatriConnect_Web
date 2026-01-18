import React, { useState, useEffect } from 'react';
import { getCityBuses, createCityBus, updateCityBus, deleteCityBus } from '../../../services/adminCityBus';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom Bus Stop Icon
const busStopIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Modern bus stop icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Helper component to center map on coordinates
const ChangeView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
};

const AdminCityRoutes = () => {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBus, setCurrentBus] = useState(null);
    const [formData, setFormData] = useState({
        busNumber: '',
        route: { 
          from: { name: '', lat: '', lng: '' }, 
          to: { name: '', lat: '', lng: '' }, 
          stops: [{ name: '', lat: '', lng: '' }] 
        }
    });

    const fetchBuses = async () => {
        setLoading(true);
        try {
            const res = await getCityBuses();
            if (res.success) {
                setBuses(res.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch city buses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBuses();
    }, []);

    // Get coordinates for the polyline
    const getPolylinePath = () => {
      const path = [];
      if (formData.route.from.lat && formData.route.from.lng) {
        path.push([parseFloat(formData.route.from.lat), parseFloat(formData.route.from.lng)]);
      }
      formData.route.stops.forEach(stop => {
        if (stop.lat && stop.lng) {
          path.push([parseFloat(stop.lat), parseFloat(stop.lng)]);
        }
      });
      if (formData.route.to.lat && formData.route.to.lng) {
        path.push([parseFloat(formData.route.to.lat), parseFloat(formData.route.to.lng)]);
      }
      return path;
    };

    const handleStopChange = (index, field, value) => {
        const newStops = [...formData.route.stops];
        newStops[index] = { ...newStops[index], [field]: value };
        setFormData({ ...formData, route: { ...formData.route, stops: newStops } });
    };

    const handlePointChange = (point, field, value) => {
      setFormData({
        ...formData,
        route: {
          ...formData.route,
          [point]: { ...formData.route[point], [field]: value }
        }
      });
    };

    const addStop = () => {
        setFormData({ ...formData, route: { ...formData.route, stops: [...formData.route.stops, { name: '', lat: '', lng: '' }] } });
    };

    const removeStop = (index) => {
        const newStops = formData.route.stops.filter((_, i) => i !== index);
        setFormData({ ...formData, route: { ...formData.route, stops: newStops } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const cleanData = {
                ...formData,
                route: {
                    ...formData.route,
                    from: { ...formData.route.from, lat: parseFloat(formData.route.from.lat) || 0, lng: parseFloat(formData.route.from.lng) || 0 },
                    to: { ...formData.route.to, lat: parseFloat(formData.route.to.lat) || 0, lng: parseFloat(formData.route.to.lng) || 0 },
                    stops: formData.route.stops.map(stop => ({
                      ...stop,
                      lat: parseFloat(stop.lat) || 0,
                      lng: parseFloat(stop.lng) || 0
                    }))
                }
            };

            if (currentBus) {
                await updateCityBus(currentBus._id, cleanData);
                toast.success('Route updated successfully');
            } else {
                await createCityBus(cleanData);
                toast.success('Route created successfully');
            }
            closeModal();
            fetchBuses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this route?')) {
            try {
                await deleteCityBus(id);
                toast.success('Route deleted');
                fetchBuses();
            } catch (error) {
                toast.error('Failed to delete');
            }
        }
    };

    const openModal = (bus = null) => {
        if (bus) {
            setCurrentBus(bus);
            setFormData({
                busNumber: bus.busNumber,
                route: {
                    from: bus.route.from || { name: '', lat: '', lng: '' },
                    to: bus.route.to || { name: '', lat: '', lng: '' },
                    stops: bus.route.stops?.length ? bus.route.stops : [{ name: '', lat: '', lng: '' }]
                }
            });
        } else {
            setCurrentBus(null);
            setFormData({ 
              busNumber: '', 
              route: { 
                from: { name: '', lat: '', lng: '' }, 
                to: { name: '', lat: '', lng: '' }, 
                stops: [{ name: '', lat: '', lng: '' }] 
              } 
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentBus(null);
    };

    const [roadPath, setRoadPath] = useState([]);
    const polylinePath = getPolylinePath();

    // Fetch road-following path from OSRM
    useEffect(() => {
        const fetchRoadPath = async () => {
            if (polylinePath.length < 2) {
                setRoadPath([]);
                return;
            }

            try {
                // Convert coordinates to lng,lat format for OSRM
                const coordsString = polylinePath
                    .map(coord => `${coord[1]},${coord[0]}`)
                    .join(';');
                
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
                );
                const data = await response.json();

                if (data.routes && data.routes.length > 0) {
                    const roadCoords = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    setRoadPath(roadCoords);
                } else {
                    // Fallback to straight line if OSRM fails
                    setRoadPath(polylinePath);
                }
            } catch (error) {
                console.error('Routing error:', error);
                setRoadPath(polylinePath);
            }
        };

        const timer = setTimeout(() => {
            fetchRoadPath();
        }, 500); // Debounce to avoid excessive API calls

        return () => clearTimeout(timer);
    }, [polylinePath.map(p => p.join(',')).join('|')]); // Deep compare coordinates

    const mapCenter = polylinePath.length > 0 ? polylinePath[0] : [27.7172, 85.3240]; // Default to Kathmandu

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#59f20d]"></div>
                <p className="text-[#a6ba9c] text-xs font-black uppercase tracking-widest animate-pulse">Syncing Map Data...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-2">City Bus <br/>Routes</h2>
                    <p className="text-[#a6ba9c] text-xs font-semibold opacity-60">Manage local bus routes, coordinates, and stops.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="bg-[#59f20d] text-[#0d140a] px-8 py-4 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase transition-all shadow-[0_0_20px_rgba(89,242,13,0.2)] hover:bg-white active:scale-95"
                >
                    Add New Route
                </button>
            </div>

            {/* Overview Chips */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Routes", val: buses.length, color: "text-white" },
                    { label: "Active Buses", val: buses.filter(b => b.active).length, color: "text-[#59f20d]" },
                    { label: "Total Stops", val: buses.reduce((acc, b) => acc + (b.route.stops?.length || 0), 0), color: "text-[#a6ba9c]" },
                    { label: "Network Health", val: "Optimal", color: "text-[#59f20d]" },
                ].map((s, i) => (
                    <div key={i} className="p-6 bg-[#1c2619] border border-[#2e3928] rounded-[28px] flex flex-col gap-1">
                        <span className={`text-2xl font-black ${s.color}`}>{s.val}</span>
                        <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40">{s.label}</span>
                    </div>
                ))}
            </div>

            {/* Routes Table */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1c2619] border border-[#2e3928] rounded-[32px] overflow-hidden shadow-2xl"
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-[#0d140a]/40 border-b border-[#2e3928]">
                                {["Bus UID", "Route Line", "Stop Count", "Status", "Action"].map((h) => (
                                    <th key={h} className="px-8 py-5 text-left text-[9px] font-black text-[#a6ba9c] uppercase tracking-[0.3em]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2e3928]/40">
                            {buses.length > 0 ? buses.map(bus => (
                                <tr key={bus._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <span className="text-[10px] font-black text-[#59f20d] uppercase tracking-widest">{bus.busNumber}</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-white">{bus.route.from?.name} ➔ {bus.route.to?.name}</span>
                                            <span className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest mt-1 opacity-40">City Transit</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs text-white/80 font-black">{bus.route.stops?.length || 0} Stations</span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[8px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${bus.active ? 'bg-[#59f20d]/10 text-[#59f20d] border-[#59f20d]/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                                            {bus.active ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right space-x-4">
                                        <button onClick={() => openModal(bus)} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a6ba9c] hover:text-[#59f20d] transition-colors">Edit</button>
                                        <button onClick={() => handleDelete(bus._id)} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a6ba9c] hover:text-red-500 transition-colors">Delete</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <p className="text-[10px] font-black text-[#a6ba9c] uppercase tracking-[0.4em] opacity-40">Zero Route Records</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0d140a]/90 backdrop-blur-md" onClick={closeModal}></motion.div>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-[#1c2619] border border-[#2e3928] rounded-[40px] w-full max-w-7xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh]"
                        >
                            {/* Form Panel */}
                            <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar border-r border-[#2e3928]">
                                <h3 className="text-white text-3xl font-black uppercase tracking-tighter leading-none mb-10">Route <br/>Configuration</h3>
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest ml-1 opacity-60">Bus Number</label>
                                            <input 
                                                className="w-full bg-[#0d140a]/60 border border-[#2e3928] rounded-xl p-4 text-white text-xs focus:border-[#59f20d] transition-all outline-none" 
                                                placeholder="e.g. CITY-X1" 
                                                value={formData.busNumber}
                                                onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                                                required
                                            />
                                        </div>
                                        
                                        {/* Starting Point */}
                                        <div className="p-6 bg-[#0d140a]/40 border border-[#2e3928] rounded-2xl space-y-4">
                                          <p className="text-[9px] font-black text-[#59f20d] uppercase tracking-widest">Starting Point</p>
                                          <input 
                                              className="w-full bg-transparent border-b border-[#2e3928] pb-2 text-white text-xs font-black placeholder-white/10 outline-none focus:border-[#59f20d]" 
                                              placeholder="Station Name" value={formData.route.from.name}
                                              onChange={(e) => handlePointChange('from', 'name', e.target.value)} required
                                          />
                                          <div className="flex gap-4">
                                            <input type="number" step="any" placeholder="Latitude" className="w-full bg-[#1c2619] border border-[#2e3928] rounded-lg p-2 text-[10px] text-white outline-none" value={formData.route.from.lat} onChange={(e) => handlePointChange('from', 'lat', e.target.value)} />
                                            <input type="number" step="any" placeholder="Longitude" className="w-full bg-[#1c2619] border border-[#2e3928] rounded-lg p-2 text-[10px] text-white outline-none" value={formData.route.from.lng} onChange={(e) => handlePointChange('from', 'lng', e.target.value)} />
                                          </div>
                                        </div>

                                        {/* Stops */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center px-1">
                                                <p className="text-[9px] font-black text-[#a6ba9c] uppercase tracking-widest opacity-40">Intermediate Stations</p>
                                                <button type="button" onClick={addStop} className="text-[#59f20d] text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                                                    Add Station
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {formData.route.stops.map((stop, index) => (
                                                    <div key={index} className="p-5 bg-white/5 border border-[#2e3928] rounded-2xl space-y-3 group hover:border-[#59f20d]/30">
                                                        <div className="flex items-center gap-3">
                                                            <input 
                                                                className="flex-1 bg-transparent border-none p-0 text-white text-xs font-black placeholder-white/20 outline-none"
                                                                placeholder={`Station ${index + 1} Name`}
                                                                value={stop.name} onChange={(e) => handleStopChange(index, 'name', e.target.value)}
                                                            />
                                                            <button type="button" onClick={() => removeStop(index)} className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <span className="material-symbols-outlined text-sm">Delete</span>
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-3">
                                                            <input type="number" step="any" placeholder="Lat" className="w-full bg-[#1c2619] border border-[#2e3928] rounded-lg p-2 text-[10px] text-white outline-none" value={stop.lat} onChange={(e) => handleStopChange(index, 'lat', e.target.value)} />
                                                            <input type="number" step="any" placeholder="Lng" className="w-full bg-[#1c2619] border border-[#2e3928] rounded-lg p-2 text-[10px] text-white outline-none" value={stop.lng} onChange={(e) => handleStopChange(index, 'lng', e.target.value)} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* End Point */}
                                        <div className="p-6 bg-[#0d140a]/40 border border-[#2e3928] rounded-2xl space-y-4">
                                          <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Final Destination</p>
                                          <input 
                                              className="w-full bg-transparent border-b border-[#2e3928] pb-2 text-white text-xs font-black placeholder-white/10 outline-none focus:border-red-400" 
                                              placeholder="Station Name" value={formData.route.to.name}
                                              onChange={(e) => handlePointChange('to', 'name', e.target.value)} required
                                          />
                                          <div className="flex gap-4">
                                            <input type="number" step="any" placeholder="Latitude" className="w-full bg-[#1c2619] border border-[#2e3928] rounded-lg p-2 text-[10px] text-white outline-none" value={formData.route.to.lat} onChange={(e) => handlePointChange('to', 'lat', e.target.value)} />
                                            <input type="number" step="any" placeholder="Longitude" className="w-full bg-[#1c2619] border border-[#2e3928] rounded-lg p-2 text-[10px] text-white outline-none" value={formData.route.to.lng} onChange={(e) => handlePointChange('to', 'lng', e.target.value)} />
                                          </div>
                                        </div>
                                    </div>
                                    <div className="pt-8 flex gap-4">
                                        <button type="submit" className="flex-1 bg-[#59f20d] text-[#0d140a] font-black py-5 rounded-2xl text-[10px] tracking-[0.4em] uppercase transition-all shadow-[0_0_20px_rgba(89,242,13,0.3)] hover:bg-white active:scale-95">Save Route</button>
                                        <button type="button" onClick={closeModal} className="px-10 bg-white/5 text-white font-black py-5 rounded-2xl text-[10px] tracking-[0.4em] uppercase transition-all">Cancel</button>
                                    </div>
                                </form>
                            </div>

                            {/* Map Panel */}
                            <div className="hidden md:block md:w-1/2 bg-[#090e07] relative">
                                <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' />
                                    <ChangeView center={mapCenter} />
                                    
                                    {/* Markers for path */}
                                    {formData.route.from.lat && formData.route.from.lng && (
                                      <Marker position={[parseFloat(formData.route.from.lat), parseFloat(formData.route.from.lng)]}>
                                        <Popup><span className="font-black text-[10px]">START: {formData.route.from.name}</span></Popup>
                                      </Marker>
                                    )}
                                    {formData.route.stops.map((stop, idx) => (
                                      stop.lat && stop.lng && (
                                        <Marker key={idx} position={[parseFloat(stop.lat), parseFloat(stop.lng)]} icon={busStopIcon}>
                                          <Popup><span className="font-black text-[10px]">STOP {idx+1}: {stop.name}</span></Popup>
                                        </Marker>
                                      )
                                    ))}
                                    {formData.route.to.lat && formData.route.to.lng && (
                                      <Marker position={[parseFloat(formData.route.to.lat), parseFloat(formData.route.to.lng)]}>
                                        <Popup><span className="font-black text-[10px]">END: {formData.route.to.name}</span></Popup>
                                      </Marker>
                                    )}

                                    {/* Polyline following roads */}
                                    {(roadPath.length > 1 || polylinePath.length > 1) && (
                                      <Polyline 
                                        positions={roadPath.length > 1 ? roadPath : polylinePath} 
                                        color="#59f20d" 
                                        weight={3} 
                                        opacity={0.8} 
                                        dashArray="1, 8" 
                                      />
                                    )}
                                </MapContainer>
                                
                                <div className="absolute top-6 right-6 z-[1000] p-4 bg-[#0d140a]/80 backdrop-blur-md border border-[#2e3928] rounded-2xl">
                                  <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Visualizer</p>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-[#59f20d]"></div>
                                    <span className="text-[8px] font-black text-[#a6ba9c] uppercase tracking-widest">Live Path Rendering</span>
                                  </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            
            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar { width: 4px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #2e3928; border-radius: 10px; }
              .leaflet-container { background: #090e07 !important; }
              .leaflet-popup-content-wrapper { background: #1c2619 !important; border: 1px solid #2e3928 !important; color: white !important; border-radius: 12px !important; }
              .leaflet-popup-tip { background: #1c2619 !important; }
            `}</style>
        </div>
    );
};

export default AdminCityRoutes;
