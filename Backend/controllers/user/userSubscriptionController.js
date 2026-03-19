import axios from 'axios';
import { catchAsyncError } from '../../middlewares/catchAsyncError.js';
import Subscription from '../../models/Subscription.js';
import { AppError } from '../../middlewares/errorMiddleware.js';

// Define plans and prices
const subscriptionPlans = {
    weekly: { durationDays: 7, price: 500 },
    monthly: { durationDays: 30, price: 1500 },
    yearly: { durationDays: 365, price: 15000 }
};

export const initiateSubscription = catchAsyncError(async (req, res, next) => {
    const { planType } = req.body;
    const userId = req.user._id;

    console.log(`[SUBSCRIPTION_INIT] Plan: ${planType}, User: ${userId}`);

    if (!subscriptionPlans[planType]) {
        console.error(`[SUBSCRIPTION_ERROR] Invalid plan: ${planType}`);
        return next(new AppError(`Invalid subscription plan: ${planType}`, 400));
    }

    // Check if user already has an active subscription
    const existingActive = await Subscription.findOne({ user: userId, status: 'active' });
    if (existingActive && existingActive.isActive()) {
        console.warn(`[SUBSCRIPTION_WARN] User already has an active plan.`);
        return next(new AppError('You already have an active subscription.', 400));
    }

    const planData = subscriptionPlans[planType];
    const amountInPaisa = Math.round(planData.price * 100);

    // Create pending subscription
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planData.durationDays);

    const subscription = await Subscription.create({
        user: userId,
        planType,
        startDate: new Date(),
        endDate: endDate,
        status: 'pending'
    });

    // Sanitization matching the working Booking Controller
    const rawFrontend = process.env.FRONTEND_URL || "http://localhost:5173";
    const safeFrontend = rawFrontend.startsWith('http') ? rawFrontend : "http://localhost:5173";
    
    const parsedPhone = req.user.phone ? req.user.phone.replace(/[^0-9]/g, '') : "9800000000";
    const safePhone = parsedPhone.length >= 10 ? parsedPhone.substring(0, 10) : "9800000000";

    const payload = {
        return_url: `${safeFrontend}/customer/subscription`,
        website_url: safeFrontend,
        amount: amountInPaisa,
        purchase_order_id: subscription._id.toString(),
        purchase_order_name: `${planType.toUpperCase()} PASS`,
        customer_info: {
            name: req.user.name ? req.user.name.substring(0, 50) : "Customer",
            email: req.user.email || "customer@example.com",
            phone: safePhone
        }
    };

    console.log(`[SUBSCRIPTION_PAYLOAD] Sending to Khalti:`, payload);

    try {
        const response = await axios.post(
            'https://a.khalti.com/api/v2/epayment/initiate/',
            payload,
            {
                headers: {
                    'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.status(200).json({
            success: true,
            paymentUrl: response.data.payment_url, // Unified with SubscriptionPage.jsx
            pidx: response.data.pidx,
            subscriptionId: subscription._id
        });

    } catch (err) {
        console.error('Subscription Khalti Init Error:', err.response?.data || err.message);
        
        // Failed to init, delete pending sub
        await Subscription.findByIdAndDelete(subscription._id);

        let errMsg = 'The Khalti gateway rejected the initiation request.';
        if (err.response?.data) {
           errMsg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
        }
        return next(new AppError(errMsg, err.response?.status || 400));
    }
});

export const verifySubscriptionPayment = catchAsyncError(async (req, res, next) => {
    const { pidx } = req.body;
    const subId = req.query.purchase_order_id || req.query.sub_id; // Check both for safety

    console.log(`[SUBSCRIPTION_VERIFY] PIDX: ${pidx}, SubID: ${subId}`);

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
        console.error('[VERIFICATION_ERR] Khalti Lookup:', err.response?.data || err.message);
        return res.status(400).json({
            success: false,
            message: 'Khalti verification failed',
            error: err.response?.data || err.message
        });
    }

    const { status } = verification.data;

    let subscriptionStatus = 'pending';
    if (status === 'Completed') {
        subscriptionStatus = 'active';
    } else if (status === 'Refunded' || status === 'Expired') {
        subscriptionStatus = status.toLowerCase(); // simplified handling
    }

    const subscription = await Subscription.findByIdAndUpdate(
        subId,
        {
            status: subscriptionStatus,
            paymentDetails: verification.data
        },
        { new: true }
    );

    if (subscriptionStatus !== 'active') {
        return res.status(400).json({
            success: false,
            message: `Payment status is ${status}`,
            data: subscription
        });
    }

    res.status(200).json({
        success: true,
        message: 'Subscription purchased successfully.',
        data: subscription
    });
});

export const getMySubscription = catchAsyncError(async (req, res, next) => {
    const subscription = await Subscription.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
        success: true,
        data: subscription
    });
});
