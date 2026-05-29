import express from 'express';
import {
    getAllCityBuses,
    getActiveCityBuses,
    checkIn,
    checkOut,
    getCurrentRide,
    calculateBusETA,
    getDriverAssignedRoutes,
    verifyTicket
} from '../../controllers/user/userCityBusController.js';
import { isAuthenticated } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get('/', getAllCityBuses);
router.get('/active', getActiveCityBuses);
router.get('/assigned', isAuthenticated, getDriverAssignedRoutes);
router.get('/eta/:busId', calculateBusETA);

router.post('/checkin', isAuthenticated, checkIn);
router.post('/checkout', isAuthenticated, checkOut);
router.get('/current-ride', isAuthenticated, getCurrentRide);
router.post('/verify-ticket', isAuthenticated, verifyTicket);

export default router;
