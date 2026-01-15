import { catchAsyncError } from '../../middlewares/catchAsyncError.js';
import CityBus from '../../models/CityBus.js';
import { AppError } from '../../middlewares/errorMiddleware.js';
import { createSystemNotification } from '../notificationController.js';

export const createCityBus = catchAsyncError(async (req, res, next) => {
    const { busNumber, route, driver } = req.body;

    const bus = await CityBus.create({
        busNumber,
        route,
        driver
    });

    res.status(201).json({
        success: true,
        data: bus
    });

    await createSystemNotification(
        "New Bus Added", 
        `Bus ${busNumber} has been added to the system.`
    );
});

export const updateCityBus = catchAsyncError(async (req, res, next) => {
    const bus = await CityBus.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!bus) {
        return next(new AppError('City Bus not found', 404));
    }

    res.status(200).json({
        success: true,
        data: bus
    });

    await createSystemNotification(
        "Bus Updated", 
        `Bus ${bus.busNumber} details have been updated.`
    );

    // Notify all clients of the updated active bus list
    const { io } = await import('../../app.js');
    const [longDist, city] = await Promise.all([
        import('../../models/Bus.js').then(m => m.default.find({ active: true }).select('currentLocation').lean()),
        CityBus.find({ active: true }).select('currentLocation').lean()
    ]);
    const locations = {};
    [...longDist, ...city].forEach(b => {
        if (b.currentLocation?.lat && b.currentLocation?.lng) {
            locations[b._id.toString()] = b.currentLocation;
        }
    });
    io.emit('active-buses', locations);
});

export const getAllCityBuses = catchAsyncError(async (req, res) => {
    const buses = await CityBus.find().populate('driver', 'name email phone');
    res.status(200).json({
        success: true,
        count: buses.length,
        data: buses
    });
});

export const deleteCityBus = catchAsyncError(async (req, res, next) => {
    const bus = await CityBus.findByIdAndDelete(req.params.id);

    if (!bus) {
        return next(new AppError('City Bus not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'City Bus deleted successfully'
    });

    // Refresh active list for all clients
    const { io } = await import('../../app.js');
    const [longDist, city] = await Promise.all([
        import('../../models/Bus.js').then(m => m.default.find({ active: true }).select('currentLocation').lean()),
        CityBus.find({ active: true }).select('currentLocation').lean()
    ]);
    const locations = {};
    [...longDist, ...city].forEach(b => {
        if (b.currentLocation?.lat && b.currentLocation?.lng) {
            locations[b._id.toString()] = b.currentLocation;
        }
    });
    io.emit('active-buses', locations);
});
