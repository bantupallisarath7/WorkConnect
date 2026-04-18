import Booking from "../../models/Booking.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const getUserBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId: userId }).sort({ createdAt: -1 })
      .select(`
          _id
          partnerId
          userId
          partnerName
          status
          bookingDate
          address
          workers
          workerDetails
          labourCost
          commission
          travelCharges
          totalAmount
          mealsProvided
          notes
          workDate
        `);             
    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(errorHandler(500,error.message || "Failed to fetch bookings"));
  }
};

export default getUserBookings;