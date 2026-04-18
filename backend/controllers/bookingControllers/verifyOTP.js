import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Booking from "../../models/Booking.js";
import User from "../../models/User.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const verifyOTP = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { bookingId } = req.params;
    const { otp } = req.body;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return next(errorHandler(400, "Invalid booking ID"));
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    // Only partner can verify OTP
    if (booking.partnerId.toString() !== userId) {
      return next(errorHandler(403, "Not authorized"));
    }

    // Booking must be in accepted state
    if (booking.status !== "accepted") {
      return next(errorHandler(400, "Booking not in accepted state"));
    }

    // OTP must exist
    if (!booking.otp || !booking.otp.code) {
      return next(errorHandler(400, "OTP not generated"));
    }

    // Prevent reuse
    if (booking.otpVerified) {
      return next(errorHandler(400, "OTP already verified"));
    }

    // Correct comparison (hashed)
    const isMatch = await bcrypt.compare(otp, booking.otp.code);

    if (!isMatch) {
      return next(errorHandler(400, "Invalid OTP"));
    }

    // Success
    booking.status = "inProgress";
    booking.otpVerified = true;

    booking.workDate = new Date();

    // Remove plain OTP after verification
    if (booking.otp) {
      booking.otp.plain = null;
    }

    if (userRole === "worker") {
      await User.findByIdAndUpdate(userId, {
        "availability.isAvailable": false,
      });
    }


    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking completed successfully",
    });

  } catch (error) {
    next(errorHandler(500, error.message || "Internal Server Error"));
  }
};

export default verifyOTP;