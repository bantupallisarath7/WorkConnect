import Booking from "../../models/Booking.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const getOTP = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return next(errorHandler(404, "Booking not found"));
    }

    // Only customer can see OTP
    if (booking.userId.toString() !== userId) {
      return next(errorHandler(403, "Not authorized"));
    }

    if (booking.status !== "accepted") {
      return next(errorHandler(400, "OTP not available"));
    }

    if (!booking.otp?.plain) {
      return next(errorHandler(400, "OTP expired or not generated"));
    }

    res.json({
      success: true,
      otp: booking.otp.plain,
      otpVerified:booking.otpVerified
    });

  } catch (error) {
    next(errorHandler(500,error.message || "Internal Server Error"));
  }
};

export default getOTP;