import express from 'express';
import {
    getAvailableBuses,
    getBusWithSeats, updateBusLocation, reserveSeats, cancelReservation
} from '../../controllers/user/busController.js';
import {authorizeRoles, isAuthenticated} from "../../middlewares/authMiddleware.js";


const router = express.Router();

router.route('/').get(getAvailableBuses);
router.route('/:id/seats').get(getBusWithSeats);
router.route('/:id/seats/reserve').post(isAuthenticated, reserveSeats);
router.route('/:id/seats/cancel-reservation').post(isAuthenticated, cancelReservation);
router.route('/:id/location').patch(
    isAuthenticated,
    authorizeRoles('driver'),
    updateBusLocation
);



export default router;
