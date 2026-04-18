import User from "../../models/User.js";
import redis from "../../config/redis.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return next(errorHandler(400, "Email and OTP are required"));
        }

        // 🔹 Get stored OTP
        const storedOtp = await redis.get(`otp:${email}`);

        if (!storedOtp) {
            return next(errorHandler(400, "OTP expired"));
        }

        if (storedOtp !== otp) {
            return next(errorHandler(400, "Invalid OTP"));
        }

        // 🔹 Get temp signup data
        const userData = await redis.get(`signup:${email}`);

        if (!userData) {
            return next(errorHandler(400, "Signup session expired. Please signup again."));
        }

        const parsedData = JSON.parse(userData);

        // 🔹 Double check (safety)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(errorHandler(400, "User already exists"));
        }

        const newUser = await User.create({
            ...parsedData,
            isVerified: true,
        });

        // 🔹 Clean Redis
        await redis.del(`otp:${email}`);
        await redis.del(`signup:${email}`);

        res.status(200).json({
            success: true,
            message: "Account created successfully",
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role,
            },
        });

    } catch (error) {
        next(errorHandler(500, error.message || "Internal Server Error"));
    }
};

export default verifyOTP;