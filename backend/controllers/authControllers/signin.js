import User from "../../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import errorHandler from "../../errorHandler/errorHandler.js";

const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(errorHandler(400, "Email and password are required"));
        }

        const user = await User.findOne({ email });

        if (!user) {

            return next(errorHandler(400, "User not found"))
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return next(errorHandler(400, "Invalid credentials"));
        }
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "7d" }
        );
        res.cookie("access_token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const filteredUser = {
            _id: user._id,
            name: user.name,
            role: user.role,
            profileImage: user.profileImage,

            availability: {
                isAvailable: user.availability?.isAvailable,
            },

            location: user.location
                ? {
                    addressLine: user.location.addressLine,
                    city: user.location.city,
                    state: user.location.state,
                }
                : null,

            rating: user.rating,
            totalJobs: user.totalJobs,
        };

        res.status(200).json({
            success: true,
            message: "Signin successful",
            user: filteredUser,
        });
    } catch (error) {
        next(errorHandler(500, error.message || "Internal Server Error"));
    }
};

export default signin;