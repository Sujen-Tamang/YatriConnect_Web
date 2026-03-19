import express from 'express';
import {
    getAllBookings,
    getBookingDetails,
    cancelBooking
} from '../../controllers/admin/adminBookingController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';
import { isAdmin } from '../../middlewares/adminMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);
router.use(isAdmin);

router.get('/', getAllBookings);
router.get('/:id', getBookingDetails);
router.put('/:id/cancel', cancelBooking);

export default router;