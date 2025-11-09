import express from 'express';
import adminBookingRoutes from './admin/bookingRoutes.js';
import adminBusRoutes from './admin/busRoutes.js';
import adminUserRoutes from './admin/userRoutes.js';
import userAuthRoutes from './user/authRoutes.js';
import userBookingRoutes from './user/bookingRoutes.js';
import userBusRoutes from './user/busRoutes.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/adminMiddleware.js';
import paymentRoutes from "./user/paymentRoutes.js";
import adminDashboardRoutes from "./admin/adminDashboardRoutes.js";
import adminCityBusRoutes from "./admin/cityBusRoutes.js";
import userCityBusRoutes from "./user/cityBusRoutes.js";
import userSubscriptionRoutes from "./user/subscriptionRoutes.js";
import adminRouteRoutes from "./admin/routeRoutes.js";
import notificationRoutes from "./notificationRoutes.js";
import adminPaymentRoutes from "./admin/adminPaymentRoutes.js";
import adminLegalRoutes from "./admin/adminLegalRoutes.js";
import profileRoutes from "./user/profileRoutes.js";

const router = express.Router();

// 1. Health Check Endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 2. Public Authentication Routes
router.use('/auth', userAuthRoutes);

// 3. Protected User Routes
router.use('/buses', userBusRoutes);
router.use('/bookings', isAuthenticated, userBookingRoutes);
router.use('/city-buses', userCityBusRoutes);
router.use('/subscriptions', userSubscriptionRoutes);
router.use('/notifications', notificationRoutes);
router.use('/profile', profileRoutes);

// 4. Admin Routes
router.use('/admin/dashboard', adminDashboardRoutes); // Dashboard routes

router.use('/admin/routes', isAuthenticated, isAdmin, adminRouteRoutes);
router.use('/admin/bookings', isAuthenticated, isAdmin, adminBookingRoutes);
router.use('/admin/buses', isAuthenticated, isAdmin, adminBusRoutes);
router.use('/admin/users', isAuthenticated, isAdmin, adminUserRoutes);
router.use('/admin/city-buses', isAuthenticated, isAdmin, adminCityBusRoutes);
router.use('/admin/payments', isAuthenticated, isAdmin, adminPaymentRoutes);
router.use('/admin/legal', isAuthenticated, isAdmin, adminLegalRoutes);

// Payment Routes
router.use('/payments', isAuthenticated, paymentRoutes);
// 5. API Documentation Redirect (Optional)
router.get('/docs', (req, res) => {
    res.redirect('https://api-docs.yourdomain.com');
});

// 6. 404 Handler
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl,
        availableEndpoints: [
            '/auth/login',
            '/buses',
            '/bookings',
            '/payments/khalti/initiate',
            '/payments/khalti/verify',
        ]
    });
});

export default router;