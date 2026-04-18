import crypto from "crypto";
import User from "../../models/User.js";
import sendEmail from "../../utils/sendEmail.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return next(errorHandler(404, "User not found"));
        }
        const token = crypto.randomBytes(32).toString("hex");

        // Hash token (security)
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Save to DB
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins

        await user.save();

        const resetURL = `http://localhost:5173/reset-password/${token}`;

        // Email message
        const message = `
      You requested a password reset.

      Click this link to reset your password:
      ${resetURL}

      This link will expire in 15 minutes.
    `;

        await sendEmail(user.email, "Password Reset", message);

        res.status(200).json({
            success: true,
            message: "Reset link sent to your email",
        });

    } catch (error) {
        next(errorHandler(500, error.message || "Internal Server Error"));
    }
};

export default forgotPassword;