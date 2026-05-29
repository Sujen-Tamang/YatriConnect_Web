import Notification from "../models/Notification.js";
import { User } from "../models/userModel.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { AppError } from "../middlewares/errorMiddleware.js";

// Admin: Send Promo to all users
export const sendPromo = catchAsyncError(async (req, res, next) => {
    const { title, message } = req.body;

    if (!title || !message) {
        return next(new AppError("Title and message are required", 400));
    }

    // Create a notification record for the promo (global)
    const promo = await Notification.create({
        title,
        message,
        type: 'promo',
        recipient: null // null means global for everyone to see
    });

    res.status(201).json({
        success: true,
        message: "Promo sent successfully",
        data: promo
    });
});

// Admin: Send announcement to all drivers
export const sendAnnouncement = catchAsyncError(async (req, res, next) => {
    const { title, message } = req.body;

    if (!title || !message) {
        return next(new AppError("Title and message are required", 400));
    }

    const drivers = await User.find({ role: 'driver' }).select('_id');
    const notifications = drivers.map((driver) => ({
        title,
        message,
        type: 'announcement',
        recipient: driver._id
    }));

    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }

    res.status(201).json({
        success: true,
        message: "Announcement sent to drivers",
        count: notifications.length
    });
});

// Admin: Get recent system notifications
export const getAdminNotifications = catchAsyncError(async (req, res, next) => {
    const { type } = req.query;
    const filter = type ? { type } : {
        type: { $in: ['promo', 'system', 'route-update', 'announcement', 'payment', 'assignment', 'bus-online', 'bus-status'] }
    };

    const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(50);

    res.status(200).json({
        success: true,
        data: notifications
    });
});

// User: Get my notifications
export const getUserNotifications = catchAsyncError(async (req, res, next) => {
    const notifications = await Notification.find({
        $or: [
            { recipient: req.user._id },
            { recipient: null } // Include global promos
        ]
    }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: notifications
    });
});

// User: Mark notification as read
export const markAsRead = catchAsyncError(async (req, res, next) => {
    const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { isRead: true },
        { new: true }
    );

    res.status(200).json({
        success: true,
        data: notification
    });
});

// Internal helper to create system notification
export const createSystemNotification = async (title, message) => {
    try {
        await Notification.create({
            title,
            message,
            type: 'system',
            recipient: null
        });
    } catch (err) {
        console.error("Failed to create system notification:", err);
    }
};

export const createUserNotification = async ({ recipient, title, message, type = 'system' }) => {
    try {
        if (!recipient) {
            return;
        }
        await Notification.create({
            title,
            message,
            type,
            recipient
        });
    } catch (err) {
        console.error("Failed to create user notification:", err);
    }
};
