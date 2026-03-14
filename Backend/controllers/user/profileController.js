import { User } from '../../models/userModel.js';
import { catchAsyncError } from '../../middlewares/catchAsyncError.js';
import { AppError } from '../../middlewares/errorMiddleware.js';

// Toggle Saved Route
export const toggleSavedRoute = catchAsyncError(async (req, res, next) => {
    const { routeId, from, to, name, type } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    const isSaved = user.savedRoutes.find(r => r.routeId === routeId);

    if (isSaved) {
        // Remove if already saved
        user.savedRoutes = user.savedRoutes.filter(r => r.routeId !== routeId);
    } else {
        // Add to saved routes
        user.savedRoutes.push({ routeId, from, to, name, type });
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: isSaved ? 'Route removed from favorites' : 'Route saved to favorites',
        savedRoutes: user.savedRoutes
    });
});

// Get Saved Routes
export const getSavedRoutes = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        savedRoutes: user.savedRoutes || []
    });
});
