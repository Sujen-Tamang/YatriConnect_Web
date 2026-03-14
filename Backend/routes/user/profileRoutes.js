import express from 'express';
import { toggleSavedRoute, getSavedRoutes } from '../../controllers/user/profileController.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/saved-routes').get(isAuthenticated, getSavedRoutes);
router.route('/saved-routes/toggle').post(isAuthenticated, toggleSavedRoute);

export default router;
