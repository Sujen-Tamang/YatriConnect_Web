import {AppError} from './errorMiddleware.js';


export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return next(new AppError('Admin access required', 403));
    }
    next();
};

export const isSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'superadmin') {
        return next(new AppError('Super Admin access required', 403));
    }
    next();
};

/**
 * Middleware for staff/admin privileges
 */
export const isStaffOrAdmin = (req, res, next) => {
    const allowedRoles = ['staff', 'admin'];
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return next(new AppError('Staff or Admin access required', 403));
    }
    next();
};