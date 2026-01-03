import { catchAsyncError } from '../../middlewares/catchAsyncError.js';
import Route from '../../models/Route.js';
import Bus from '../../models/Bus.js';
import { AppError } from '../../middlewares/errorMiddleware.js';
import { createSystemNotification } from '../notificationController.js';

// Create a new route and assign a bus
export const createRoute = catchAsyncError(async (req, res, next) => {
    try {
        const { from, to, distance, duration, price, busId, schedule } = req.body;

        if (!busId) {
            return next(new AppError('Bus ID is required', 400));
        }

        const bus = await Bus.findById(busId);
        if (!bus) {
            return next(new AppError('Bus not found', 404));
        }

        const route = await Route.create({
            from,
            to,
            distance,
            duration,
            price,
            bus: busId,
            schedule,
            active: true
        });

        await Bus.findByIdAndUpdate(busId, { 
            route: { from, to, distance, duration },
            schedule
        });

        res.status(201).json({
            success: true,
            data: route
        });

        await createSystemNotification(
            "New Route Created", 
            `A new route from ${from} to ${to} has been created.`
        );
    } catch (error) {
        console.error('CRITICAL ROUTE CREATION ERROR:', error);
        return next(new AppError(error.message || 'Error creating operational route', 500));
    }
});

// Get all routes
export const getAllRoutes = catchAsyncError(async (req, res) => {
    const routes = await Route.find().populate('bus').populate('driver', 'name email phone');
    res.status(200).json({
        success: true,
        data: routes
    });
});

// Assign driver to route
export const assignDriver = catchAsyncError(async (req, res, next) => {
    const { routeId, driverId } = req.body;

    // 1. Update Route
    const route = await Route.findByIdAndUpdate(
        routeId,
        { driver: driverId },
        { new: true, runValidators: true }
    );

    if (!route) {
        return next(new AppError('Route not found', 404));
    }

    // 2. Propagate to associated Bus if exists
    if (route.bus) {
        await Bus.findByIdAndUpdate(route.bus, { driver: driverId });
    }

    res.status(200).json({
        success: true,
        message: 'Driver assigned to route and bus successfully',
        data: route
    });

    await createSystemNotification(
        "Driver Assigned", 
        `A driver has been assigned to the route ${route.from} - ${route.to}.`
    );
});

// Delete route
export const deleteRoute = catchAsyncError(async (req, res, next) => {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) {
        return next(new AppError('Route not found', 404));
    }
    res.status(200).json({
        success: true,
        message: 'Route deleted successfully'
    });
});
