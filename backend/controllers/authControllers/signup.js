import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import errorHandler from "../../errorHandler/errorHandler.js";
import redis from "../../config/redis.js";
import { sendOTPEmail } from "../../utils/sendOTPEmail.js";

const signup = async (req, res, next) => {
    try {
        const { name, email, password, role, phone } = req.body;

        if (!name || !email || !password || !role) {
            return next(errorHandler(400, "All required fields are missing"));
        }

        const allowedRoles = ["user", "worker", "connector"];
        if (!allowedRoles.includes(role)) {
            return next(errorHandler(400, "Invalid role"));
        }

        if ((role === "worker" || role === "connector") && !phone) {
            return next(errorHandler(400, "Phone number is required"));
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(errorHandler(400, "Email already exists"));
        }

        if (phone) {
            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                return next(errorHandler(400, "Phone already exists"));
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = crypto.randomInt(1000, 9999).toString();


        await redis.set(`otp:${email}`, otp, "EX", 300);

        const tempUser = {
            name,
            email,
            password: hashedPassword,
            role,
            ...(phone && { phone }),
        };

        await redis.set(
            `signup:${email}`,
            JSON.stringify(tempUser),
            "EX",
            300
        );

        await sendOTPEmail(email, otp);

        res.status(201).json({
            success: true,
            message: "OTP sent",
        });

    } catch (error) {
        next(errorHandler(500, error.message));
    }
};

export default signup;