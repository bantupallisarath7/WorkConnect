import Booking from "../../models/Booking.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const getPartnerBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ partnerId: userId }).sort({ createdAt: -1 }).populate("userId", "name rating");

    const cleanBookings = bookings.map((b) => ({
      _id: b._id,
      status: b.status,

      // customer
      customer: {
        id: b.userId?._id,
        name: b.userId?.name,
        rating: b.userId?.rating,
      },

      contactName: b.contactName,
      contactPhone: b.contactPhone,

      mealProvided: b.mealsProvided,
      address: b.address,
      notes: b.notes,

      workers: b.workers || [],
      workerDetails: b.workerDetails || null,

      bookingDate: b.bookingDate,

      labourCost: b.labourCost,
      commission: b.commission,
      travelCharges: b.travelCharges,
      totalAmount: b.totalAmount,

      paymentMethod: b.paymentMethod,

      createdAt: b.createdAt,

    }));

    res.status(200).json({
      success: true,
      count: cleanBookings.length,
      bookings: cleanBookings,
    });
  } catch (error) {
    next(errorHandler(500, error.message || "Failed to fetch bookings"));
  }
};

export default getPartnerBookings;