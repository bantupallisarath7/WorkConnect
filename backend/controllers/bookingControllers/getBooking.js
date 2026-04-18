import Booking from "../../models/Booking.js";
import errorHandler from "../../errorHandler/errorHandler.js";
import mongoose from "mongoose";

const getBooking = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Validate booking ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(errorHandler(400, "Invalid booking ID"));
    }

    // Fetch booking with related user and partner
    const booking = await Booking.findById(id)
      .populate("userId", "name email phone")
      .populate("partnerId", "name email phone role");

    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    // Authorization check (only user or partner can access)
    const isUser = booking.userId._id.toString() === userId;
    const isPartner = booking.partnerId._id.toString() === userId;

    if (!isUser && !isPartner) {
      return next(errorHandler(403, "Not authorized"));
    }

    // Convert mongoose document to plain object
    const responseBooking = booking.toObject();

    // OTP handling
    if (responseBooking.otp) {
      // Show OTP only to user when booking is accepted and not verified
      if (isUser && booking.status === "accepted" && !booking.otpVerified) {
        responseBooking.otp = responseBooking.otp.plain || null;
      } else {
        // Hide OTP from partner or after completion
        responseBooking.otp = null;
      }
    }

    // Ensure hashed OTP is never exposed
    if (responseBooking.otp?.code) {
      delete responseBooking.otp.code;
    }

    res.status(200).json({
      success: true,
      booking: responseBooking,
    });

  } catch (error) {
    next(errorHandler(500, error.message || "Failed to fetch booking"));
  }
};

export default getBooking;