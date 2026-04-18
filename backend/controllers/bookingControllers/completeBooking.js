import mongoose from "mongoose";
import Booking from "../../models/Booking.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const completeBooking = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { bookingId } = req.params;
        const { manual } = req.body;

        // Validate ID
        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return next(errorHandler(400, "Invalid booking ID"));
        }

        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return next(errorHandler(404, "Booking not found"));
        }

        // Only partner allowed
        if (booking.partnerId.toString() !== userId &&
            booking.userId.toString() !== userId) {
            return next(errorHandler(403, "Not authorized"));
        }

        // Must be in progress
        if (booking.status !== "inProgress") {
            return next(errorHandler(400, "Booking not in progress"));
        }

        const now = Date.now();
        const bookingTime = new Date(booking.workDate).getTime();
        const isAfter8Hours = (now - bookingTime) >= 8 * 60 * 60 * 1000;

        // Decision Logic
        if (manual) {
            // Manual override
            booking.status = "completed";
        } else if (isAfter8Hours) {
            // Auto completion
            booking.status = "completed";
        } else {
            return next(
                errorHandler(400, "Cannot complete before 8 hours unless manual")
            );
        }

        await booking.save();

        res.status(200).json({
            success: true,
            message: manual
                ? "Booking manually completed"
                : "Booking auto-completed after 8 hours",
        });

    } catch (error) {
        next(errorHandler(500, error.message));
    }
};

export default completeBooking;