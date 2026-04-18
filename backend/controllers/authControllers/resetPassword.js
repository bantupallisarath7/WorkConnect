import errorHandler from "../../errorHandler/errorHandler.js";
import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash incoming token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return next(errorHandler(400, "Invalid or expired token"));

        }

        // Update password

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful",
        });

    } catch (error) {
        next(errorHandler(500, error.message || "Internal Server Error"));
    }
};
export default resetPassword;