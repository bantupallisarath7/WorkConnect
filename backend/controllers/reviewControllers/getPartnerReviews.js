import Review from "../../models/Review.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const getPartnerReviews = async (req, res, next) => {
  const currentUserId = req.user?.id || null;
  try {
    const { userId } = req.params;

    if (!userId) {
      return next(errorHandler(400, "User ID is required"));
    }

    const reviews = await Review.find({ reviewedUser: userId })
      .populate("reviewer", "name profileImage")
      .sort({ createdAt: -1 })
      .lean();

    const enrichedReviews = reviews.map((review) => {
      let isLiked = false;
      if (currentUserId) {
        isLiked = review.helpfulUsers?.some(
          (id) => id.toString() === currentUserId
        );
      }

      return {
        ...review,
        isLiked,
      };
    });

    res.status(200).json({
      success: true,
      total: enrichedReviews.length,
      reviews: enrichedReviews
    });
  } catch (err) {
    next(errorHandler(500, "Failed to fetch reviews"));
  }
};
export default getPartnerReviews;