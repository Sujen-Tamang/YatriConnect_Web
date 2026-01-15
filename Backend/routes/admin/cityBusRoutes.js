import express from 'express';
import {
    createCityBus,
    updateCityBus,
    deleteCityBus,
    getAllCityBuses
} from '../../controllers/admin/adminCityBusController.js';

const router = express.Router();

// POST /admin/city-buses - Create new city bus
router.post('/', createCityBus);

// GET /admin/city-buses - Get all city buses
router.get('/', getAllCityBuses);

// PUT /admin/city-buses/:id - Update city bus
router.put('/:id', updateCityBus);

// DELETE /admin/city-buses/:id - Delete city bus
router.delete('/:id', deleteCityBus);

export default router;
