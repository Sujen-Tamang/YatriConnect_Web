import express from 'express';
import {
    initiateSubscription,
    verifySubscriptionPayment,
    getMySubscription
} from '../../controllers/user/userSubscriptionController.js';
import { isAuthenticated } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.post('/initiate', isAuthenticated, initiateSubscription);
router.post('/verify', isAuthenticated, verifySubscriptionPayment);
router.get('/my-subscription', isAuthenticated, getMySubscription);

export default router;
