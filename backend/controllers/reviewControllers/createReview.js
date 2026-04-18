import errorHandler from "../../errorHandler/errorHandler.js";
import Booking from "../../models/Booking.js";
import Review from "../../models/Review.js";
import updatePartnerRating from "./updatePartnerRating.js";

const createReview = async (req, res, next) => {
  try {
    const reviewerId = req.user.id;

    const {
      reviewedUser,
      booking,
      rating,
      comment,
      reviewerRole,
      tags,
    } = req.body;

    // 1. Validate self-review
    if (reviewerId === reviewedUser) {
      return next(errorHandler(400,"You cannot review yourself"));
    }

    // 2. Validate booking exists (optional but recommended)
    if (booking) {
      const existingBooking = await Booking.findById(booking);

      if (!existingBooking) {
        return next(errorHandler(404,"Booking not found"));
      }
 
      // Optional: ensure booking belongs to reviewer
      if (existingBooking.userId.toString() !== reviewerId) {
        return next(errorHandler(403,"Not allowed for this booking"));
      }
    }

    if (!reviewedUser || !rating || !reviewerRole) {
  return next(errorHandler(400, "Missing required fields"));
}

    // 3. Prevent duplicate review for same booking
    if (booking) {
      const existingReview = await Review.findOne({
        reviewer: reviewerId,
        booking,
      });

      if (existingReview) {
        return next(errorHandler(400,"You already reviewed this booking"));
      }
    }

    // 4. Create review
    const review = await Review.create({
      reviewer: reviewerId,
      reviewedUser,
      booking: booking || null,
      rating,
      comment,
      reviewerRole,
      tags,
    });

    await updatePartnerRating(reviewedUser);

    return res.status(201).json({
        success:true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    return next(errorHandler(500, error.message || "Internal Server Error"));
  }
};

export default createReview;