import { catchAsyncError } from '../../middlewares/catchAsyncError.js';
import CityBus from '../../models/CityBus.js';
import Bus from '../../models/Bus.js';
import CityBusRide from '../../models/CityBusRide.js';
import { AppError } from '../../middlewares/errorMiddleware.js';
import Booking from '../../models/Booking.js';
import Subscription from '../../models/Subscription.js';
import { User } from '../../models/userModel.js';

// Get all city buses
export const getActiveCityBuses = catchAsyncError(async (req, res, next) => {
    const buses = await CityBus.find({ active: true });
    res.status(200).json({
        success: true,
        count: buses.length,
        data: buses
    });
});

// User check-in to a city bus
export const checkIn = catchAsyncError(async (req, res, next) => {
    const { busId } = req.body;
    
    // Check if user already has an ongoing ride
    const existingRide = await CityBusRide.findOne({ 
        user: req.user._id, 
        status: 'ongoing' 
    });

    if (existingRide) {
        return next(new AppError('You have an ongoing transit session', 400));
    }

    const bus = await CityBus.findById(busId);
    if (!bus) {
        return next(new AppError('Bus not identified', 404));
    }

    const ride = await CityBusRide.create({
        user: req.user._id,
        bus: busId,
        status: 'ongoing'
    });

    res.status(201).json({
        success: true,
        message: 'Boarding confirmed',
        data: ride
    });
});

// User check-out from a city bus
export const checkOut = catchAsyncError(async (req, res, next) => {
    const ride = await CityBusRide.findOneAndUpdate(
        { user: req.user._id, status: 'ongoing' },
        { 
            status: 'completed', 
            checkOutTime: Date.now() 
        },
        { new: true }
    );

    if (!ride) {
        return next(new AppError('No active transit session found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Checked out successfully',
        data: ride
    });
});

// Get current ride details for the logged-in user
export const getCurrentRide = catchAsyncError(async (req, res, next) => {
    const ride = await CityBusRide.findOne({ user: req.user._id, status: 'ongoing' })
        .populate('bus');

    if (!ride) {
        return res.status(200).json({
            success: true,
            message: 'No active ride found',
            data: null
        });
    }

    res.status(200).json({
        success: true,
        data: ride
    });
});

/**
 * Calculate ETAs for all stops based on current bus location
 * Uses OSRM Table Service
 */
export const calculateBusETA = catchAsyncError(async (req, res, next) => {
    const { busId } = req.params;

    const bus = await CityBus.findById(busId);
    if (!bus) {
        return next(new AppError('Vehicle identity not found', 404));
    }

    const { currentLocation, route } = bus;

    if (!currentLocation || !currentLocation.lat || !currentLocation.lng) {
        return res.status(200).json({
            success: true,
            status: 'offline',
            message: 'Vehicle telemetry offline',
            etas: []
        });
    }

    const stops = route.stops || [];
    const destination = route.to;
    const points = [
        [currentLocation.lng, currentLocation.lat],
        ...stops.map(s => [s.lng, s.lat]),
        [destination.lng, destination.lat]
    ];

    const coordsString = points.map(p => p.join(',')).join(';');

    try {
        let durationsArray = [];

        if (!process.env.OPENROUTESERVICE_API_KEY) {
            throw new Error('OpenRouteService API key is missing. OSRM fallback has been removed.');
        }

        // OpenRouteService Integration
        const orsUrl = 'https://api.openrouteservice.org/v2/matrix/driving-car';
        const response = await fetch(orsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': process.env.OPENROUTESERVICE_API_KEY
            },
            body: JSON.stringify({
                locations: points,
                sources: [0],
                metrics: ['duration']
            })
        });
        const data = await response.json();
        if (!data.durations || !data.durations[0]) {
            throw new Error('Routing error from OpenRouteService');
        }
        durationsArray = data.durations[0];

        const now = new Date();
        const etas = stops.map((stop, index) => {
            const seconds = durationsArray[index + 1];
            const etaTime = new Date(now.getTime() + seconds * 1000);
            return {
                name: stop.name,
                minutes: Math.round(seconds / 60),
                time: etaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                distanceStatus: seconds < 120 ? 'Arriving' : 'En route'
            };
        });

        const destSecs = durationsArray[points.length - 1];
        const destEtaTime = new Date(now.getTime() + destSecs * 1000);

        res.status(200).json({
            success: true,
            busNumber: bus.busNumber,
            currentLocation: bus.currentLocation,
            etas,
            destinationEta: {
                name: destination.name,
                minutes: Math.round(destSecs / 60),
                time: destEtaTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            },
            updatedAt: now
        });

    } catch (error) {
        return next(new AppError('Failed to compute transit ETAs', 500));
    }
});

// Get assigned routes for a driver (from both City and Inter-city buses)
export const getDriverAssignedRoutes = catchAsyncError(async (req, res, next) => {
    // We assume both models have 'driver' field now
    const [cityBuses, longBuses] = await Promise.all([
        CityBus.find({ driver: req.user._id }),
        Bus.find({ driver: req.user._id })
    ]);

    // Map longBuses to match the format expected by UI if necessary
    // But for now, we just merge
    const allBuses = [...cityBuses, ...longBuses];

    res.status(200).json({
        success: true,
        count: allBuses.length,
        data: allBuses
    });
});

// Verify ticket (Booking or Subscription) for Driver
export const verifyTicket = catchAsyncError(async (req, res, next) => {
    const { ticketData } = req.body;
    
    if (!ticketData) {
        return next(new AppError('No ticket data provided', 400));
    }

    let parsedData;
    try {
        parsedData = typeof ticketData === 'string' ? JSON.parse(ticketData) : ticketData;
    } catch (e) {
        return next(new AppError('Invalid ticket format', 400));
    }

    const { type, id } = parsedData;

    if (type === 'booking') {
        const booking = await Booking.findById(id).populate('user', 'name email phone');
        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        if (booking.status !== 'Confirmed') {
            return res.status(200).json({
                success: false,
                status: 'INVALID',
                message: `Booking status is ${booking.status}`,
                details: {
                    passenger: booking.user?.name || 'Unknown',
                    id: booking._id
                }
            });
        }

        return res.status(200).json({
            success: true,
            status: 'VALID',
            message: 'Ticket verified successfully',
            details: {
                passenger: booking.user?.name || 'Unknown',
                id: booking._id,
                seats: booking.seats,
                journeyDate: booking.journeyDate
            }
        });

    } else if (type === 'subscription') {
        const subscription = await Subscription.findById(id).populate('user', 'name email phone');
        if (!subscription) {
            return next(new AppError('Subscription not found', 404));
        }

        const now = new Date();
        const isExpired = new Date(subscription.endDate) < now;

        if (subscription.status !== 'active' || isExpired) {
            return res.status(200).json({
                success: false,
                status: 'INVALID',
                message: isExpired ? 'Pass has expired' : `Pass status is ${subscription.status}`,
                details: {
                    passenger: subscription.user?.name || 'Unknown',
                    id: subscription._id
                }
            });
        }

        return res.status(200).json({
            success: true,
            status: 'VALID',
            message: 'Pass verified successfully',
            details: {
                passenger: subscription.user?.name || 'Unknown',
                id: subscription._id,
                plan: subscription.planType,
                expiry: subscription.endDate
            }
        });
    }

    return next(new AppError('Unknown ticket type', 400));
});

