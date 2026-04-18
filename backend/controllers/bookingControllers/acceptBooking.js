import mongoose from "mongoose";
import Booking from "../../models/Booking.js";
import errorHandler from "../../errorHandler/errorHandler.js";
import bcrypt from "bcryptjs";

const acceptBooking = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { bookingId } = req.params;

        // ✅ Validate ID
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return next(errorHandler(400, "Invalid booking ID"));
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return next(errorHandler(404, "Booking not found"));
        }

        // 🔒 Only partner (connector/worker) can accept
        if (booking.partnerId.toString() !== userId) {
            return next(errorHandler(403, "Not authorized to accept this booking"));
        }

        //  Prevent duplicate processing
        if (booking.status !== "pending") {
            return next(errorHandler(400, "Booking already processed"));
        }

        // 🔢 Generate OTP (4 digit)
        const otp = Math.floor(1000 + Math.random() * 9000).toString();

        const hashedOtp = await bcrypt.hash(otp, 10);

        booking.otp = {
            code: hashedOtp,
            plain: otp, 
        };

        booking.status = "accepted";

        await booking.save();

        res.status(200).json({
            success: true,
            message: "Booking accepted successfully",
        });

    } catch (error) {
        next(errorHandler(500, error.message || "Internal Server Error"));
    }
};

export default acceptBooking;