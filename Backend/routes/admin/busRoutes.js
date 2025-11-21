import express from 'express';
import {
    createBus,
    updateBus,
    deleteBus,
    getAllBuses
} from '../../controllers/admin/adminBusController.js';

const router = express.Router();

// POST /admin/buses - Create new bus
router.post('/', createBus);

// GET /admin/buses - Get all buses
router.get('/', getAllBuses);

// PUT /admin/buses/:id - Update bus
router.put('/:id', updateBus);

// DELETE /admin/buses/:id - Delete bus
router.delete('/:id', deleteBus);

export default router;