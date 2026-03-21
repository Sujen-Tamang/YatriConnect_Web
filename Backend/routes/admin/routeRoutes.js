import express from 'express';
import { createRoute, getAllRoutes, assignDriver, deleteRoute } from '../../controllers/admin/adminRouteController.js';

const router = express.Router();

router.post('/', createRoute);
router.get('/', getAllRoutes);
router.put('/assign-driver', assignDriver);
router.delete('/:id', deleteRoute);

export default router;
