import Review from "../../models/Review.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const markHelpful = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    const review = await Review.findOne({
      _id: reviewId,
      isDeleted: false,
    });

    if (!review) {
      return next(errorHandler(404, "Review not found"));
    }

    const alreadyLiked = review.helpfulUsers.includes(userId);

    let updatedReview;

    if (alreadyLiked) {
      updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        {
          $pull: { helpfulUsers: userId },
          $inc: { helpfulCount: -1 },
        },
        { new: true }
      );
    } else {
      updatedReview = await Review.findByIdAndUpdate(
        reviewId,
        {
          $addToSet: { helpfulUsers: userId },
          $inc: { helpfulCount: 1 },
        },
        { new: true }
      );
    }

    return res.status(200).json({
      success: true,
      helpfulCount: updatedReview.helpfulCount,
      liked: !alreadyLiked,
    });

  } catch (error) {
    return next(errorHandler(500, error.message));
  }
};

export default markHelpful;