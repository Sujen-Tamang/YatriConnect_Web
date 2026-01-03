import { catchAsyncError } from '../../middlewares/catchAsyncError.js';
import Bus from '../../models/Bus.js';

import { AppError } from '../../middlewares/errorMiddleware.js';

export const createBus = catchAsyncError(async (req, res, next) => {
    const { busNumber, yatayatName, route, schedule, totalSeats, price } = req.body;

    const bus = await Bus.create({
        busNumber,
        yatayatName,
        route,
        schedule,
        totalSeats,
        price
    });

    res.status(201).json({
        success: true,
        data: bus
    });
});

export const updateBus = catchAsyncError(async (req, res, next) => {
    const bus = await Bus.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!bus) {
        return next(new AppError('Bus not found', 404));
    }

    res.status(200).json({
        success: true,
        data: bus
    });
});

// ... other controller methods
export const getAllBuses = catchAsyncError(async (req, res) => {
    const buses = await Bus.find();
    res.status(200).json({
        success: true,
        count: buses.length,
        data: buses
    });
});

export const deleteBus = catchAsyncError(async (req, res, next) => {
    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
        return next(new AppError('Bus not found', 404));
    }

    res.status(200).json({
        success: true,
        message: 'Bus deleted successfully'
    });
});