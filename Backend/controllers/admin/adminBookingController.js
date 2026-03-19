import { catchAsyncError } from '../../middlewares/catchAsyncError.js';
import Booking  from '../../models/Booking.js';
import {AppError} from '../../middlewares/errorMiddleware.js';

// Get all bookings (admin only)

export const getAllBookings = catchAsyncError(async (req, res, next) => {
    const bookings = await Booking.find()
        .populate('user', 'name email')
        .populate('bus', 'busNumber route');

    res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
    });
});


export const getBookingDetails = catchAsyncError(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id)
        .populate('user', 'name email phone')
        .populate('bus', 'busNumber route schedule');

    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    res.status(200).json({
        success: true,
        data: booking
    });
});

// Cancel any booking (admin only)
export const cancelBooking = catchAsyncError(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    // Additional logic to free up seats if needed
    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully'
    });
});