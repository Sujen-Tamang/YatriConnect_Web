import Bus from '../../models/Bus.js';
import { catchAsyncError } from '../../middlewares/catchAsyncError.js';
import { AppError } from '../../middlewares/errorMiddleware.js';
import { User } from "../../models/userModel.js";
import  Booking  from "../../models/Booking.js";
import nodemailer from 'nodemailer';
import { Payment } from "../../models/Payment.js";
import { generateETicket } from "../../utils/eTicketGenerator.js";


export const createTempBooking = catchAsyncError(async (req, res, next) => {
    const { busId, seats, travelDate } = req.body;
    const userId = req.user._id;

    // 1. Check user verification
    const user = await User.findById(userId);
    if (!user?.isVerified) {
        return next(new AppError('Please verify your account before booking', 401));
    }

    // 2. Check bus availability
    const bus = await Bus.findById(busId).populate('route');
    if (!bus || !bus.active) {
        return next(new AppError('Bus not available', 400));
    }

    // 3. Validate seat availability
    const unavailableSeats = seats.filter(seatNum =>
        !bus.seats.some(s => s.number === seatNum && !s.isBooked)
    );

    if (unavailableSeats.length > 0) {
        return next(new AppError(`Seats ${unavailableSeats.join(', ')} are taken`, 400));
    }

    // 4. Create temporary booking (holds seats for 10 minutes)
    const tempBooking = await Booking.create({
        bookingId: `TEMP-${Date.now()}`,
        user: userId,
        bus: busId,
        seats,
        travelDate,
        totalPrice: bus.price * seats.length,
        status: 'Pending',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
    });

    // 5. Temporarily reserve seats
    await Bus.findByIdAndUpdate(busId, {
        $set: {
            'seats.$[elem].isBooked': true,
            'seats.$[elem].bookedBy': userId,
            'seats.$[elem].bookingDate': new Date()
        }
    }, { arrayFilters: [{ 'elem.number': { $in: seats } }] });

    res.status(200).json({
        success: true,
        message: 'Temporary booking created. Proceed to payment.',
        data: {
            bookingId: tempBooking._id,
            amount: tempBooking.totalPrice,
            expiresAt: tempBooking.expiresAt
        }
    });
});


export const confirmBooking = catchAsyncError(async (req, res, next) => {
    const { bookingId, paymentId } = req.body;
    const userId = req.user._id;

    // 1. Verify payment
    const payment = await Payment.findOne({
        _id: paymentId,
        user: userId,
        booking: bookingId,
        status: 'completed'
    });

    if (!payment) {
        return next(new AppError('Payment not verified', 402));
    }

    // 2. Get and validate temporary booking
    const booking = await Booking.findOne({
        _id: bookingId,
        user: userId,
        status: 'Pending',
        expiresAt: { $gt: new Date() }
    }).populate('bus');

    if (!booking) {
        return next(new AppError('Invalid or expired booking', 400));
    }

    // 3. Update booking status and payment reference
    booking.status = 'Confirmed';
    booking.payment = paymentId;
    booking.bookingId = `BK${Date.now()}`;
    await booking.save();

    // 4. Generate and send e-ticket
    const user = await User.findById(userId);
    const eTicket = generateETicket(booking, user, booking.bus);
    await sendEmail({
        email: user.email,
        subject: `Your E-Ticket for Booking ${booking.bookingId}`,
        html: eTicket,
        attachments: [
            {
                filename: `ETicket-${booking.bookingId}.pdf`,
                content: pdfBuffer,
            },
        ],
    });

    res.status(200).json({
        success: true,
        message: 'Booking confirmed! E-ticket sent to your email',
        data: booking
    });
});

/**
 * @desc    Get all bookings for current user
 * @route   GET /api/bookings
 * @access  Private
 */
export const getMyBookings = catchAsyncError(async (req, res, next) => {
    const bookings = await Booking.find({ user: req.user._id })
        .populate({
            path: 'bus',
            select: 'busNumber route schedule price',
            populate: {
                path: 'route',
                select: 'from to distance duration'
            }
        })
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
    });
});

/**
 * @desc    Cancel user's booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private
 */
export const cancelMyBooking = catchAsyncError(async (req, res, next) => {
    const booking = await Booking.findOne({
        _id: req.params.id,
        user: req.user._id,
        status: { $in: ['Confirmed', 'Pending'] }
    });

    if (!booking) {
        return next(new AppError('Booking not found or already cancelled', 404));
    }

    // Free up seats
    await Bus.findByIdAndUpdate(booking.bus, {
        $set: {
            'seats.$[elem].isBooked': false,
            'seats.$[elem].bookedBy': null,
            'seats.$[elem].bookingDate': null
        }
    }, {
        arrayFilters: [{ 'elem.number': { $in: booking.seats } }]
    });

    // Update booking status
    booking.status = 'Cancelled';
    booking.cancelledAt = new Date();
    await booking.save();

    res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: {
            bookingId: booking.bookingId,
            cancelledAt: booking.cancelledAt
        }
    });
});

export const getBookingById = catchAsyncError(async (req, res, next) => {
    const booking = await Booking.findOne({
        _id: req.params.id,
        user: req.user._id
    })
    .populate('user', 'name email phone')
    .populate({
        path: 'bus',
        select: 'busNumber yatayatName route schedule price',
        populate: {
            path: 'route',
            select: 'from to distance duration'
        }
    });

    if (!booking) {
        return next(new AppError('Booking not found', 404));
    }

    res.status(200).json({
        success: true,
        data: booking
    });
});

// Email sender utility
const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail(options);
};

