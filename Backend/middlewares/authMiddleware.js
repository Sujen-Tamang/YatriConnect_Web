import jwt from 'jsonwebtoken';
import { AppError } from './errorMiddleware.js';
import {User} from "../models/userModel.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return next(new AppError('Not authorized to access this route', 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) {
            return next(new AppError('User not found', 404));
        }

        next();
    } catch (err) {
        return next(new AppError('Not authorized to access this route', 401));
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(`Role (${req.user.role}) is not allowed to access this resource`, 403)
            );
        }
        next();
    };
};