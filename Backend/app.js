import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import routes from './routes/index.js';
import Bus from './models/Bus.js';
import CityBus from './models/CityBus.js';
import Booking from './models/Booking.js';
import jwt from 'jsonwebtoken';
import { createUserNotification } from './controllers/notificationController.js';

// Initialize Express
export const app = express();

// Create HTTP server and Socket.IO instance
export const server = createServer(app);
export const io = new Server(server, {
    cors: {
        origin: true, // Allow all origins for socket testing
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    },
    path: '/socket.io',
});

// Database connection
connectDB().catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
});

// Middlewares
app.use(
    cors({
        origin: [
            process.env.FRONTEND_URL,
            'http://localhost:5173',
            'http://localhost:4000',
            'http://192.168.1.94:4000',
            'http://192.168.1.94:8081',
            'http://192.168.1.102:4000',
            'http://192.168.1.102:3000',
            'https://yatri-connect-web.vercel.app'
        ].filter(Boolean),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', routes);

// Helper to get all active locations from both models
async function getActiveBusLocations() {
    const [longDist, city] = await Promise.all([
        Bus.find({ active: true }).select('currentLocation status busNumber').lean(),
        CityBus.find({ active: true }).select('currentLocation status busNumber').lean()
    ]);

    const locations = {};
    [...longDist, ...city].forEach(bus => {
        locations[bus._id.toString()] = {
            lat: bus.currentLocation?.lat || 27.7172, // Fallback to KTM center if no point yet
            lng: bus.currentLocation?.lng || 85.3240,
            status: bus.status || 'on-route',
            busNumber: bus.busNumber || `Bus ${bus._id.toString().slice(-4)}`
        };
    });
    return locations;
}

// Socket authentication middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error'));
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (err) {
        next(new Error('Authentication error'));
    }
});

// Socket.IO Logic for Bus Tracking
io.on('connection', (socket) => {
    console.log('Socket.IO client connected:', socket.id);

    // Driver location update (works for both Bus and CityBus IDs)
    socket.on('driver-location-update', async ({ busId, location }) => {
        if (!mongoose.Types.ObjectId.isValid(busId) || !location?.lat || !location?.lng) {
            socket.emit('error', { message: 'Invalid bus ID or location data' });
            return;
        }

        try {
            // Check both models for the ID
            let updatedBus = await Bus.findByIdAndUpdate(
                busId,
                { $set: { currentLocation: { ...location, updatedAt: new Date() } } },
                { new: true }
            );

            if (!updatedBus) {
                updatedBus = await CityBus.findByIdAndUpdate(
                    busId,
                    { $set: { currentLocation: { ...location, updatedAt: new Date() } } },
                    { new: true }
                );
            }

            if (!updatedBus) {
                socket.emit('error', { message: 'Bus not found' });
                return;
            }

            // 1. Specific update for those already focused on this bus
            io.to(busId).emit('bus-location-update', {
                busId,
                location: updatedBus.currentLocation,
            });

            // 2. Global update for the main map to catch new/moving buses
            // Only emit globally if the bus is actively on shift
            if (updatedBus.active) {
                io.emit('bus-location-update', {
                    busId,
                    location: {
                        ...location,
                        status: updatedBus.status || 'on-route',
                        busNumber: updatedBus.busNumber
                    }
                });
            }

            console.log(`[TELEMETRY] Bus ${updatedBus.busNumber || busId} -> Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}`);
        } catch (err) {
            socket.emit('error', { message: 'Failed to update location' });
        }
    });

    socket.on('trackBus', (busId) => {
        if (mongoose.Types.ObjectId.isValid(busId)) {
            socket.join(busId);
        }
    });

    socket.on('request-buses', async () => {
        try {
            const locations = await getActiveBusLocations();
            socket.emit('active-buses', locations);
        } catch (err) {
            socket.emit('error', { message: 'Failed to fetch active buses' });
        }
    });

    // TRACKING ACTIVE DRIVERS PER SOCKET
    socket.on('driver-status-update', async ({ busId, status }) => {
        if (!mongoose.Types.ObjectId.isValid(busId) || !['on-route', 'break', 'offline'].includes(status)) {
            socket.emit('error', { message: 'Invalid shift status' });
            return;
        }

        try {
            const active = status !== 'offline';

            const previousLongBus = await Bus.findById(busId).select('status busNumber').lean();
            let previousStatus = previousLongBus?.status;
            let isLongBus = Boolean(previousLongBus);

            // Store the active bus for this socket to handle accidental disconnects
            if (active) {
                socket.activeBusId = busId;
            } else {
                delete socket.activeBusId;
            }

            let updatedBus = await Bus.findByIdAndUpdate(
                busId,
                { $set: { status, active } },
                { new: true }
            );

            if (!updatedBus) {
                const previousCityBus = await CityBus.findById(busId).select('status busNumber').lean();
                if (!previousStatus) {
                    previousStatus = previousCityBus?.status;
                }

                updatedBus = await CityBus.findByIdAndUpdate(
                    busId,
                    { $set: { status, active } },
                    { new: true }
                );

                if (updatedBus) {
                    isLongBus = false;
                }
            }

            if (!updatedBus) {
                socket.emit('error', { message: 'Bus not identified' });
                return;
            }

            const statusChanged = previousStatus && previousStatus !== status;
            if (statusChanged && isLongBus) {
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(startOfDay);
                endOfDay.setDate(endOfDay.getDate() + 1);

                const bookings = await Booking.find({
                    bus: busId,
                    status: 'Confirmed',
                    travelDate: { $gte: startOfDay, $lt: endOfDay }
                }).select('user bookingId');

                const uniqueUsers = new Set(bookings.map((booking) => booking.user?.toString()).filter(Boolean));

                const statusTitleMap = {
                    'on-route': 'Bus Is On Route',
                    'break': 'Bus Is On Break',
                    'offline': 'Route Ended'
                };

                const statusMessageMap = {
                    'on-route': `Your bus ${updatedBus.busNumber || 'assigned bus'} is now on route.`,
                    'break': `Your bus ${updatedBus.busNumber || 'assigned bus'} is currently on break.`,
                    'offline': `Your bus ${updatedBus.busNumber || 'assigned bus'} has ended the route.`
                };

                await Promise.all(
                    Array.from(uniqueUsers).map((userId) => createUserNotification({
                        recipient: userId,
                        title: statusTitleMap[status] || 'Bus Status Update',
                        message: statusMessageMap[status] || `Your bus ${updatedBus.busNumber || 'assigned bus'} status changed to ${status}.`,
                        type: status === 'on-route' ? 'bus-online' : 'bus-status'
                    }))
                );
            }

            // Sync all maps immediately
            const locations = await getActiveBusLocations();
            io.emit('active-buses', locations);

            // Global notification for real-time removal or color change
            io.emit('bus-status-changed', { busId, status, active });

            // If offline, explicitly tell clients to remove it from live state
            if (!active) {
                io.emit('bus-deactivated', { busId });
            }

        } catch (err) {
            socket.emit('error', { message: 'Shift status sync failed' });
        }
    });

    socket.on('disconnect', async () => {
        console.log('Socket.IO client disconnected:', socket.id);

        // If this was an active driver who just disconnected
        if (socket.activeBusId) {
            try {
                const busId = socket.activeBusId;
                // We set him to 'offline' on crash/close, or at least break?
                // Let's set to offline to be safe for "start shift" requirement
                await Promise.all([
                    Bus.findByIdAndUpdate(busId, { $set: { active: false, status: 'offline' } }),
                    CityBus.findByIdAndUpdate(busId, { $set: { active: false, status: 'offline' } })
                ]);

                io.emit('bus-deactivated', { busId });
                const locations = await getActiveBusLocations();
                io.emit('active-buses', locations);

                console.log(`Auto-deactivated Bus ${busId} due to driver disconnect`);
            } catch (err) {
                console.error("Cleanup on disconnect failed", err);
            }
        }
    });
});

// Error middleware
app.use(errorMiddleware);