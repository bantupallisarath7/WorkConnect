import redis from "../../config/redis.js";
import User from "../../models/User.js";
import crypto from "crypto";
import { sendOTPEmail } from "../../utils/sendOTPEmail.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        const otp = crypto.randomInt(1000, 9999).toString();

        await redis.set(`otp:${email}`, otp, "EX", 300);

        await sendOTPEmail(email, otp);

        res.status(200).json({
            success: true,
            message: "OTP resent successfully",
        });
    } catch (error) {
        next(errorHandler(500, error.message));
    }
};

export default resendOTP;