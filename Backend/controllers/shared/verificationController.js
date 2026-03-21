import { sendEmail } from "../../utils/sendEmail.js";
import { sendToken } from "../../utils/sendToken.js";
import { User } from "../../models/userModel.js";
import { generateVerificationCode } from "../../models/userModel.js";

export const sendVerificationEmailCode = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const verificationCode = user.generateVerificationCode();


        user.verificationCode = verificationCode;
        await user.save();


        const message = `
            <p>Hello ${user.name},</p>
            <p>Your verification code is: <strong>${verificationCode}</strong></p>
            <p>Please enter this code to verify your email.</p>
        `;

        // Send verification email
        await sendEmail({
            email,
            subject: "Email Verification",
            message,
        });

        res.status(200)
        .json({ message: 'Verification code sent to email.' });

    } catch (error) {
        console.error("Verification error: ", error);
        res.status(500).json({ message: 'Error sending verification code', error });
    }
};

// Verify the verification code
export const verifyEmailCode = async (req, res) => {
    const { email, verificationCode } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the verification code matches
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Mark the user as verified
        user.accountVerified = true;
        user.verificationCode = null; // Clear the verification code
        await user.save();

        // Send a token after successful email verification
        sendToken(user, 200, 'Email verified successfully', res); // Use sendToken to return a JWT

    } catch (error) {
        console.error("Verification error: ", error);
        res.status(500).json({ message: 'Error verifying email', error });
    }
};
