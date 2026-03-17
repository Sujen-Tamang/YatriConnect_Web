// controllers/user/esewaController.js
import { catchAsyncError } from '../../middlewares/catchAsyncError.js';
import Booking  from '../../models/Booking.js';
import { Payment } from '../../models/Payment.js';
import crypto from 'crypto';
import axios from 'axios';

// Configuration
const getEsewaConfig = () => ({
    baseUrl: process.env.NODE_ENV === 'production'
        ? process.env.ESEWA_PRODUCTION_URL
        : process.env.ESEWA_TEST_URL || 'https://rc.esewa.com.np',
    merchantId: process.env.ESEWA_MERCHANT_ID || 'EPAYTEST',
    secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q'
});

// Add this export that was missing
export const initiateEsewaPayment = catchAsyncError(async (req, res, next) => {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return next(new Error('Booking not found'));
    }

    const config = getEsewaConfig();
    const signature = crypto
        .createHmac('sha256', config.secretKey)
        .update(`total_amount=${booking.totalAmount},transaction_uuid=${booking._id},product_code=${config.merchantId}`)
        .digest('base64');

    const paymentData = {
        amt: booking.totalAmount,
        psc: 0,
        pdc: 0,
        txAmt: 0,
        tAmt: booking.totalAmount,
        pid: booking._id.toString(),
        scd: config.merchantId,
        su: `${process.env.BACKEND_URL}/api/payments/esewa/verify`,
        fu: `${process.env.FRONTEND_URL}/payment/failed`,
        signature
    };

    await Payment.create({
        booking: booking._id,
        amount: booking.totalAmount,
        paymentMethod: 'esewa',
        status: 'pending',
        referenceId: booking._id.toString()
    });

    res.status(200).json({
        success: true,
        paymentUrl: `${config.baseUrl}/epay/main`,
        paymentData
    });
});

// Keep your existing verifyEsewaPayment function
export const verifyEsewaPayment = catchAsyncError(async (req, res, next) => {
    // ... existing verify implementation ...
});