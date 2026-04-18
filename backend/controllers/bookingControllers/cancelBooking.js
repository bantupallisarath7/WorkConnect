import mongoose from "mongoose";
import Booking from "../../models/Booking.js";
import WorkforceCapacity from "../../models/WorkforceCapacity.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const cancelBooking = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const userId = req.user.id;
      const { bookingId } = req.params;

      // Validate ID
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        throw errorHandler(400, "Invalid booking ID");
      }

      // Fetch booking
      const booking = await Booking.findById(bookingId).session(session);

      if (!booking) {
        throw errorHandler(404, "Booking not found");
      }

      // Prevent invalid cancellations
      if (["cancelled", "completed"].includes(booking.status)) {
        throw errorHandler(
          400,
          booking.status === "cancelled"
            ? "Booking already cancelled"
            : "Booking already completed"
        );
      }

      // Authorization
      const isUser = booking.userId.toString() === userId;
      const isPartner = booking.partnerId.toString() === userId;

      if (!isUser && !isPartner) {
        throw errorHandler(403, "Unauthorized to cancel this booking");
      }

      if (booking.workers && booking.workers.length > 0) {
        for (const w of booking.workers) {
          await WorkforceCapacity.updateOne(
            { _id: w.worker },
            {
              $inc: { count: w.count }, //  atomic restore
            },
            { session }
          );
        }
      }

      const updatedBooking = await Booking.findOneAndUpdate(
        {
          _id: bookingId,
          status: { $nin: ["cancelled", "completed"] }, // 🔥 guard
        },
        {
          $set: {
            status: "cancelled",
            otp: null,
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedBooking) {
        throw errorHandler(400, "Booking already processed");
      }

      // Response
      res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
        booking: updatedBooking,
      });
    });
  } catch (error) {
    next(errorHandler(500, error.message || "Failed to cancel booking"));
  } finally {
    session.endSession();
  }
};

export default cancelBooking;