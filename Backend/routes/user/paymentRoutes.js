import express from 'express';
import {initiateKhaltiPayment, verifyKhaltiPayment} from "../../controllers/user/khaltiController.js";
import {isAuthenticated} from "../../middlewares/authMiddleware.js";
import {initiateEsewaPayment, verifyEsewaPayment} from "../../controllers/user/esewaController.js";

const router = express.Router();

// Khalti payment routes
router.post('/khalti/initiate', initiateKhaltiPayment);
router.post('/khalti/verify', verifyKhaltiPayment);

// esewa payment routes
router.post('/esewa/initiate',isAuthenticated, initiateEsewaPayment );
router.get('/esewa/verify',isAuthenticated, verifyEsewaPayment );


export default router;