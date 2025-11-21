import Bus from '../../models/Bus.js';
import { catchAsyncError } from '../../middlewares/catchAsyncError.js';
import { AppError } from '../../middlewares/errorMiddleware.js';
import { io } from '../../app.js';

export const getAvailableBuses = catchAsyncError(async (req, res, next) => {
    const { from, to, date, minSeats } = req.query;
    const query = {};

    if (from) query['route.from'] = { $regex: new RegExp(from, 'i') };
    if (to) query['route.to'] = { $regex: new RegExp(to, 'i') };

    if (date) {
        const searchDate = new Date(date);
        const startDate = new Date(searchDate.setHours(0, 0, 0, 0));
        const endDate = new Date(searchDate.setHours(23, 59, 59, 999));
        query['schedule.departure'] = { $gte: startDate, $lte: endDate };
    }

    let buses = await Bus.find(query).lean();

    if (minSeats) {
        const minSeatsNum = parseInt(minSeats);
        buses = buses.filter((bus) =>
            (bus.seats || []).filter((s) => !s.isBooked).length >= minSeatsNum
        );
    }

    res.status(200).json({
        success: true,
        count: buses.length,
        data: buses.map((bus) => ({
            id: bus._id,
            yatayatName: bus.yatayatName,
            busNumber: bus.busNumber,
            route: bus.route,
            schedule: bus.schedule,
            availableSeats: (bus.seats || []).filter((s) => !s.isBooked).length,
            price: bus.price,
            amenities: bus.amenities,
        })),
    });
});

    export const getBusWithSeats = catchAsyncError(async (req, res, next) => {
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return next(new AppError('Invalid bus ID format', 400));
        }

        const bus = await Bus.findById(req.params.id).lean();

        if (!bus) {
            return next(new AppError('Bus not found', 404));
        }

        const response = {
            id: bus._id,
            yatayatName: bus.yatayatName,
            busNumber: bus.busNumber,
            route: bus.route,
            schedule: bus.schedule,
            price: bus.price,
            totalSeats: bus.seats.length,
            availableSeats: bus.seats.filter((s) => !s.isBooked && (!s.reservedUntil || new Date(s.reservedUntil) < new Date())).length,
            seats: bus.seats.map((seat) => {
                const isReserved = seat.reservedUntil && new Date(seat.reservedUntil) > new Date();
                return {
                number: seat.number,
                available: !seat.isBooked && !isReserved,
                features: seat.features || [],
                ...(req.user?.role === 'admin' && {
                    bookedBy: seat.bookedBy,
                    bookingDate: seat.bookingDate,
                }),
            };
            }),
            currentLocation: bus.currentLocation,
        };

        res.status(200).json({
            success: true,
            data: response,
        });
    });

    export const updateBusLocation = catchAsyncError(async (req, res, next) => {
        const { lat, lng } = req.body;
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return next(new AppError('Invalid bus ID format', 400));
        }
        if (typeof lat !== 'number' || typeof lng !== 'number' || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return next(new AppError('Invalid latitude or longitude', 400));
        }

        const updatedBus = await Bus.findByIdAndUpdate(
            id,
            {
                $set: {
                    currentLocation: { lat, lng, updatedAt: new Date() },
                },
            },
            { new: true }
        ).select('busNumber yatayatName route currentLocation');

        if (!updatedBus) {
            return next(new AppError('Bus not found', 404));
        }

        io.to(id).emit('bus-location-update', {
            busId: id,
            location: updatedBus.currentLocation,
        });

        res.status(200).json({
            success: true,
            data: updatedBus,
        });
    });

export const reserveSeats = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { seats } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) return next(new AppError('Invalid bus ID format', 400));
    if (!seats || !Array.isArray(seats) || seats.length === 0) return next(new AppError('No seats provided', 400));

    const bus = await Bus.findById(id);
    if (!bus) return next(new AppError('Bus not found', 404));

    const now = new Date();
    const expiryTime = new Date(now.getTime() + 5 * 60000); // 5 minutes

    // Check if seats are available
    for (const seatNumber of seats) {
        const seat = bus.seats.find(s => s.number === seatNumber);
        if (!seat) return next(new AppError(`Seat ${seatNumber} not found`, 404));
        
        const isReservedByOther = seat.reservedUntil && new Date(seat.reservedUntil) > now && String(seat.reservedBy) !== String(req.user._id);
        if (seat.isBooked || isReservedByOther) {
            return next(new AppError(`Seat ${seatNumber} is no longer available`, 400));
        }
    }

    // Reserve seats
    bus.seats.forEach(seat => {
        if (seats.includes(seat.number)) {
            seat.reservedBy = req.user._id;
            seat.reservedUntil = expiryTime;
        }
    });

    await bus.save();

    res.status(200).json({
        success: true,
        message: 'Seats reserved for 5 minutes',
        reservedUntil: expiryTime
    });
});

export const cancelReservation = catchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { seats } = req.body;

    const bus = await Bus.findById(id);
    if (!bus) return next(new AppError('Bus not found', 404));

    let updated = false;
    bus.seats.forEach(seat => {
        if (seats.includes(seat.number) && String(seat.reservedBy) === String(req.user._id)) {
            seat.reservedBy = undefined;
            seat.reservedUntil = undefined;
            updated = true;
        }
    });

    if (updated) {
        await bus.save();
    }

    res.status(200).json({
        success: true,
        message: 'Reservation cancelled'
    });
});