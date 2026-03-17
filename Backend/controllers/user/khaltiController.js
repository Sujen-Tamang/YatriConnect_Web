import axios from 'axios';
import { catchAsyncError } from "../../middlewares/catchAsyncError.js";
import { AppError } from "../../middlewares/errorMiddleware.js";
import { Payment } from "../../models/Payment.js";
import Booking from "../../models/Booking.js";
import Bus from "../../models/Bus.js";


export const initiateKhaltiPayment = catchAsyncError(async (req, res, next) => {
    const { bookingId, amount, busId, seats, journeyDate } = req.body;
    const userId = req.user._id;

    // 1. Strict Validation
    if (!amount || isNaN(amount) || amount <= 0) {
        return next(new AppError('A valid payment amount is required', 400));
    }
    const targetBusId = busId || bookingId || 'UnknownBus';

    // 2. Booking Instance Verification
    let booking = null;
    if (bookingId) {
        booking = await Booking.findOne({ _id: bookingId, user: userId, status: 'Pending' });
    }

    if (!booking) {
        const generatedId = 'BK-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
        booking = await Booking.create({
            bookingId: generatedId,
            user: userId,
            bus: targetBusId,
            seats: seats || ['1A'],
            travelDate: journeyDate || new Date(),
            totalPrice: amount,
            status: 'Pending',
            expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        });
    }

    // NEW: Reserve seats in Bus model during initiation to prevent race conditions
    if (seats && seats.length > 0 && busId) {
        await Bus.findByIdAndUpdate(busId, {
            $set: {
                'seats.$[elem].reservedBy': userId,
                'seats.$[elem].reservedUntil': new Date(Date.now() + 30 * 60 * 1000) // Match booking expiry
            }
        }, {
            arrayFilters: [{ 'elem.number': { $in: seats } }]
        });
    }

    // 3. Khalti Safe Payload Preparation
    const safeAmount = Math.round(Number(amount) * 100); // Strictly integer paisa
    const rawFrontend = process.env.FRONTEND_URL || "http://localhost:5173";
    const safeFrontend = rawFrontend.startsWith('http') ? rawFrontend : "http://localhost:5173";
    
    const safeReturnUrl = `${safeFrontend}/payment/khalti/callback?booking=${booking._id}`;
    const safeWebsiteUrl = safeFrontend;
    const safeOrderId = booking._id.toString();
    const safeOrderName = `Booking ${booking.bookingId}`;

    const parsedPhone = req.user.phone ? req.user.phone.replace(/[^0-9]/g, '') : "9800000000";
    const safePhone = parsedPhone.length >= 10 ? parsedPhone.substring(0, 10) : "9800000000";

    const payload = {
        return_url: safeReturnUrl,
        website_url: safeWebsiteUrl,
        amount: safeAmount,
        purchase_order_id: safeOrderId,
        purchase_order_name: safeOrderName,
        customer_info: {
            name: req.user.name ? req.user.name.substring(0, 50) : "Customer",
            email: req.user.email || "customer@example.com",
            phone: safePhone
        }
    };

    try {
        // 4. Khalti Initiation
        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/initiate/',
            payload,
            { headers: { 'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`, 'Content-Type': 'application/json' } }
        );

        // 5. Payment Registry
        const payment = await Payment.create({
            user: userId,
            booking: booking._id,
            pidx: response.data.pidx,
            amount: amount,
            payment_method: 'khalti',
            status: 'initiated',
            transactionId: null
        });

        // 6. Return response
        res.status(200).json({
            success: true,
            payment_url: response.data.payment_url,
            pidx: response.data.pidx,
            bookingId: booking._id
        });

    } catch (error) {
        console.error('Khalti Critical Failure:', error.response?.data || error.message);
        let errMsg = 'The Khalti gateway rejected the initiation request.';
        if (error.response?.data) {
           errMsg = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
        }
        return next(new AppError(errMsg, error.response?.status || 400));
    }
});

export const verifyKhaltiPayment = catchAsyncError(async (req, res, next) => {
    const { pidx, transaction_id, amount } = req.body;
    const bookingId = req.query.booking;

    // Verify with Khalti
    let verification;
    try {
        verification = await axios.post(
            'https://a.khalti.com/api/v2/epayment/lookup/',
            { pidx },
            {
                headers: {
                    'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`
                }
            }
        );
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: 'Khalti verification failed',
            error: err.response?.data || err.message
        });
    }

    if (verification.data.status !== 'Completed') {
        return res.status(400).json({
            success: false,
            message: 'Payment not completed',
            verification: verification.data
        });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
        { pidx },
        {
            status: 'completed',
            transactionId: transaction_id || verification.data.transaction_id,
            amount: amount / 100
        },
        { new: true }
    );


    // CRITICAL: Update Booking Status and Bus Seats
    if (bookingId) {
        const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
            status: 'Confirmed',
            payment: payment?._id,
            $unset: { expiresAt: 1 }
        });

        if (updatedBooking) {
            await Bus.findByIdAndUpdate(updatedBooking.bus, {
                $set: {
                    'seats.$[elem].isBooked': true,
                    'seats.$[elem].bookedBy': updatedBooking.user,
                    'seats.$[elem].bookingDate': new Date(),
                    'seats.$[elem].reservedBy': null,
                    'seats.$[elem].reservedUntil': null
                }
            }, {
                arrayFilters: [{ 'elem.number': { $in: updatedBooking.seats } }]
            });
        }
    }

    res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
            paymentId: payment?._id,
            bookingId
        }
    });
});
