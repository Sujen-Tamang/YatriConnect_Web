import express from 'express';
import { 
    sendPromo, 
    getAdminNotifications, 
    getUserNotifications, 
    markAsRead 
} from '../controllers/notificationController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Admin routes
router.post('/promo', isAuthenticated, isAdmin, sendPromo);
router.get('/admin', isAuthenticated, isAdmin, getAdminNotifications);

// User routes
router.get('/my', isAuthenticated, getUserNotifications);
router.put('/:id/read', isAuthenticated, markAsRead);

export default router;
