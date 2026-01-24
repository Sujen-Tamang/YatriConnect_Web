// src/components/Map/LiveMap.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Bus Icon Creator
const createBusIcon = (status) => {
    const color = status === 'break' ? '#f59e0b' : '#59f20d';
    return L.divIcon({
        className: 'custom-bus-marker',
        html: `
            <div style="
                background: ${color};
                width: 38px;
                height: 38px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 0 15px ${color}80;
                transform: rotate(0deg);
                transition: all 0.3s ease;
            ">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="4" width="16" height="12" rx="2" ry="2"></rect>
                    <rect x="6" y="8" width="4" height="4"></rect>
                    <rect x="14" y="8" width="4" height="4"></rect>
                    <path d="m18 16 2 2"></path>
                    <path d="m6 16-2 2"></path>
                    <path d="M9 20h6"></path>
                </svg>
            </div>
            <div style="
                position: absolute;
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 6px solid white;
            "></div>
        `,
        iconSize: [38, 42],
        iconAnchor: [19, 42],
        popupAnchor: [0, -42]
    });
};

// Helper component to update map view when center changes
function ChangeView({ center }) {
    const map = useMap();
    React.useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

const LiveMap = ({ buses }) => {
    const defaultCenter = [27.7172, 85.3240]; // kathmandu as fallback
    
    // Calculate center based on active buses
    const getMapCenter = () => {
        const busLocations = Object.values(buses);
        if (busLocations.length === 0) return defaultCenter;

        const avgLat = busLocations.reduce((sum, loc) => sum + loc.lat, 0) / busLocations.length;
        const avgLng = busLocations.reduce((sum, loc) => sum + loc.lng, 0) / busLocations.length;
        return [avgLat, avgLng];
    };

    const center = getMapCenter();

    return (
        <MapContainer
            center={center}
            zoom={14}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%', background: '#f8fafc' }}
        >
            <ChangeView center={center} />
            
            {/* LIGHT MODE MAP SKIN (CartoDB Positron) */}
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {Object.entries(buses).map(([busId, data]) => (
                <Marker 
                    key={busId} 
                    position={[data.lat, data.lng]}
                    icon={createBusIcon(data.status)}
                >
                    <Popup>
                        <div className="p-1 font-bold text-[#0d140a]">
                            <p className="text-xs uppercase">{data.busNumber || `Bus ${busId.slice(-4)}`}</p>
                            <p className="text-[10px] mt-1 text-gray-500">{data.status === 'break' ? 'Currently on Break' : 'On Active Route'}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default LiveMap;