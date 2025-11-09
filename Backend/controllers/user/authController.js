import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import {User} from "../../models/userModel.js";
import {sendEmail} from "../../utils/sendEmail.js";
import {catchAsyncError} from "../../middlewares/catchAsyncError.js";
import {AppError} from "../../middlewares/errorMiddleware.js";
import mongoose from "mongoose";

// Register User
export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, phone, password, role, otp } = req.body;

    // 1. Validate all required fields
    if (!name || !email || !phone || !password || !role) {
        return next(new AppError("All fields are required.", 400));
    }

    // 2. Validate Nepal phone number format
    const validatePhoneNumber = (phone) => /^\+977\d{10}$/.test(phone);
    if (!validatePhoneNumber(phone)) {
        return next(new AppError("Invalid phone number format. Use +977XXXXXXXXXX", 400));
    }

    // 3. Check for existing verified user by phone or email
    const existingUser = await User.findOne({
        $or: [
            { email, isVerified: true },
            { phone, isVerified: true }
        ]
    });

    if (existingUser) {
        const duplicateField = existingUser.email === email ? "Email" : "Phone number";
        return next(new AppError(`${duplicateField} is already registered`, 400));
    }

    // 4. Check for unverified duplicates
    const unverifiedUser = await User.findOneAndDelete({
        $or: [
            { email, isVerified: false },
            { phone, isVerified: false }
        ]
    });

    if (unverifiedUser) {
        console.log(`Cleaned up unverified user: ${unverifiedUser._id}`);
    }

    // 5. Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        isVerified: false,
        otp,
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully. Please verify your account.",
        data: { userId: user._id }
    });
});

// Send Verification Code
export const sendVerificationCode = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Email is required", 400));
    }

    // Find user (including unverified ones)
    const user = await User.findOne({ email });

    console.log('Pre-verification user status:', {
        email,
        exists: !!user,
        verified: user?.isVerified,
        existingCode: user?.verificationCode
    });

    if (!user) {
        return next(new AppError("No account found with this email", 404));
    }
    if (user.isVerified) {
        return next(new AppError("Account is already verified", 400));
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Update user document ATOMICALLY
    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            verificationCode,
            verificationCodeExpire: Date.now() + 10 * 60 * 1000 // 10 minutes
        },
        { new: true }
    );

    console.log('Updated user with verification code:', {
        newCode: updatedUser.verificationCode,
        expiresAt: new Date(updatedUser.verificationCodeExpire)
    });

    // Send email
    const message = `Your verification code is: ${verificationCode}`;
    await sendEmail({
        email,
        subject: "Verify Your Account",
        message
    });

    res.status(200).json({
        success: true,
        message: "Verification code sent to your email",
        debug: { // Temporary for debugging
            userId: user._id,
            codeSaved: verificationCode,
            expiresIn: "10 minutes"
        }
    });
});



// Verify OTP
export const verifyOTP = catchAsyncError(async (req, res, next) => {
    const { email, otp } = req.body;

    // 1. Input validation
    if (!email || !otp) {
        return next(new AppError("Email and OTP are required", 400));
    }

    const session = await mongoose.startSession();
    try {
        session.startTransaction();

        // 2. Find user with verification fields
        const user = await User.findOne({ email })
            .select('+verificationCode +verificationCodeExpire +isVerified')
            .session(session);

        // 3. Validation checks
        if (!user) {
            return next(new AppError("No account found with this email", 404));
        }
        if (user.isVerified) {
            return next(new AppError("Account is already verified", 400));
        }
        if (!user.verificationCode || user.verificationCode !== Number(otp)) {
            return next(new AppError("Invalid verification code", 400));
        }
        if (Date.now() > user.verificationCodeExpire) {
            return next(new AppError("Verification code has expired", 400));
        }

        // 4. Update user verification status
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    isVerified: true,
                    verificationCode: null,
                    verificationCodeExpire: null
                }
            },
            {
                new: true,
                runValidators: true,
                session
            }
        );

        // 5. Generate new JWT token with verification status
        const token = jwt.sign(
            {
                id: updatedUser._id,
                role: updatedUser.role,
                isVerified: true // Critical for frontend
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '1d' }
        );

        await session.commitTransaction();

        // 6. Prepare response data
        const userData = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified,
            createdAt: updatedUser.createdAt
        };

        // 7. Send response
        res.status(200).json({
            success: true,
            message: "Account verified successfully",
            token,
            user: userData
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Verification error:', error);
        return next(new AppError("Verification failed. Please try again.", 500));
    } finally {
        session.endSession();
    }
});


// User Login
export const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
        return next(new AppError("Email and password are required", 400));
    }

    // 2. Find user (with password field)
    const user = await User.findOne({ email }).select('+password +isVerified'); // Explicitly include isVerified

    if (!user) {
        return next(new AppError("Account not found", 401));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError("Incorrect password", 401));
    }

    // 5. Generate token
    const token = jwt.sign(
        { id: user._id, role: user.role, isVerified: user.isVerified },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    // 6. Create clean user object for response
    const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified, // Explicitly include
        createdAt: user.createdAt,
        // Add any other fields you need
    };

    // 7. Send response
    res.status(200).json({
        success: true,
        token,
        user: userResponse // Use the clean response object
    });
});
// User Logout
export const logout = catchAsyncError(async (req, res, next) => {
    res.cookie('token', '', {
        expires: new Date(Date.now()),
        httpOnly: true
    }).json({
        success: true,
        message: "Logged out successfully"
    });
});

// Get Current User
export const getCurrentUser = catchAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
        success: true,
        user
    });
});

// Forgot Password
export const forgotPassword = catchAsyncError(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Email is required", 400));
    }

    const user = await User.findOne({ email })
        .select('+isVerified +resetPasswordToken +resetPasswordExpire +verificationCode +verificationCodeExpire');

    console.log('Password reset request details:', {
        email,
        userExists: !!user,
        accountStatus: user ? {
            verified: user.isVerified !== undefined ? user.isVerified : 'field-not-retrieved',
            hasActiveReset: user.resetPasswordToken && new Date(user.resetPasswordExpire) > new Date()
        } : null,
        dbRecord: user ? {
            _id: user._id,
            email: user.email,
            verified: user.isVerified,
            verificationFields: {
                hasCode: !!user.verificationCode,
                codeExpires: user.verificationCodeExpire
            },
            // Add raw document view for debugging
            rawDocument: {
                isVerified: user.toObject().isVerified,
                resetPasswordToken: user.toObject().resetPasswordToken,
                resetPasswordExpire: user.toObject().resetPasswordExpire
            }
        } : null
    });

    // 4. Verify user exists
    if (!user) {
        return next(new AppError("No account found with this email address", 404));
    }

    // 5. Check verification status with fallback
    const isVerified = user.isVerified !== undefined ? user.isVerified : false;
    if (!isVerified) {
        return next(new AppError("Please verify your account before resetting password", 403));
    }
    // 5. Check for existing valid reset token (Temporarily disabled for development/testing)
    // if (user.resetPasswordToken && new Date(user.resetPasswordExpire) > new Date()) {
    //     return next(new AppError("A password reset link has already been sent to your email", 429));
    // }

    // 6. Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 7. Update user with reset token (30 minute expiry)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // 8. Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;

    // 9. Send email
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your Password Reset Link',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Password Reset Request</h2>
                    <p>Hello ${user.name},</p>
                    <p>We received a request to reset your password. Click the button below to proceed:</p>
                    <a href="${resetUrl}" 
                       style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                        Reset Password
                    </a>
                    <p>This link will expire in 30 minutes.</p>
                    <p>If you didn't request this, please ignore this email or contact support.</p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="font-size: 12px; color: #6b7280;">
                        For security reasons, this email was sent to ${user.email}.
                    </p>
                </div>
            `,
            text: `Password Reset Link: ${resetUrl} (Valid for 30 minutes)`
        });

        // 10. Respond with success
        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email",
            debug: process.env.NODE_ENV === 'development' ? {
                userId: user._id,
                tokenExpires: new Date(Date.now() + 30 * 60 * 1000).toISOString()
            } : undefined
        });

    } catch (err) {
        // 11. Clean up on email failure
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        console.error('Failed to send password reset email:', {
            error: err.message,
            stack: err.stack,
            userId: user._id,
            email: user.email
        });

        return next(new AppError("Failed to send password reset email. Please try again later.", 500));
    }
});

// Reset Password
export const resetPassword = catchAsyncError(async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return next(new AppError("Passwords do not match", 400));
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError("Invalid or expired token", 400));
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Automatically log the user in
    const authToken = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    res.cookie('token', authToken, {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }).json({
        success: true,
        message: "Password reset successful",
        token: authToken
    });
});

// Update User Profile
export const updateProfile = catchAsyncError(async (req, res, next) => {
    const { name, email, phone } = req.body;
    let user = await User.findById(req.user.id);
    
    // Check if email is being changed
    if (email && email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new AppError("Email already in use", 400));
        }
        
        // Generate new OTP for email update
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.verificationCode = otp;
        user.verificationCodeExpire = Date.now() + 10 * 60 * 1000;
        user.pendingEmail = email; // Store the new email temporarily
        
        // Update name and phone immediately if provided
        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();
        
        // Send OTP to the NEW email
        try {
            await sendEmail({
                email,
                subject: "Verify Your New Email",
                message: `Your verification code is: ${otp}. This code is required to finalize your email update.`
            });
            
            return res.status(200).json({
                success: true,
                otpRequired: true,
                message: "Verification code sent to your new email."
            });
        } catch (err) {
            return next(new AppError("Profile updated but failed to send verification email.", 500));
        }
    }

    // Standard profile update (no email change)
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        { name, email, phone },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: updatedUser
    });
});

// Verify Email Update OTP
export const verifyEmailUpdate = catchAsyncError(async (req, res, next) => {
    const { otp } = req.body;

    if (!otp) {
        return next(new AppError("Please provide verification code", 400));
    }

    const user = await User.findById(req.user.id)
        .select("+verificationCode +verificationCodeExpire +pendingEmail");

    if (!user.verificationCode || user.verificationCode !== Number(otp)) {
        return next(new AppError("Invalid verification code", 400));
    }

    if (Date.now() > user.verificationCodeExpire) {
        return next(new AppError("Verification code has expired", 400));
    }

    if (!user.pendingEmail) {
        return next(new AppError("No pending email update found", 400));
    }

    // Finalize the email update
    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.verificationCode = undefined;
    user.verificationCodeExpire = undefined;
    user.isVerified = true;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Email updated successfully",
        user
    });
});

// Update Password (Authenticated)
export const updatePassword = catchAsyncError(async (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
        return next(new AppError("Please provide all password fields", 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new AppError("New passwords do not match", 400));
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        return next(new AppError("Incorrect old password", 401));
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password updated successfully"
    });
});