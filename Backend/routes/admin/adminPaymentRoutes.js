import express from 'express';
import { getAllPayments, getPaymentStats } from '../../controllers/admin/adminPaymentController.js';

const router = express.Router();

router.get('/', getAllPayments);
router.get('/stats', getPaymentStats);

export default router;
