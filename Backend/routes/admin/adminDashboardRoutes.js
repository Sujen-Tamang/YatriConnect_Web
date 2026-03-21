import express from 'express';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';
import { isAdmin } from '../../middlewares/adminMiddleware.js';
import {
    getDashboardStats,
    getRecentBookings,
    getPopularRoutes,
} from '../../controllers/admin/adminDashboardController.js';

const router = express.Router();

// Admin Dashboard Routes
router.get('/', isAuthenticated, isAdmin, (req, res) => console.log('Admin Dashboard'));
router.get('/stats', isAuthenticated, isAdmin, getDashboardStats);
router.get('/bookings/recent', isAuthenticated, isAdmin, getRecentBookings);
router.get('/routes/popular', isAuthenticated, isAdmin, getPopularRoutes);

export default router;