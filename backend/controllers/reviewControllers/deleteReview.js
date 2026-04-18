import errorHandler from "../../errorHandler/errorHandler.js";
import Review from "../../models/Review.js";

const deleteReview = async (req, res) => {
    try {
        const reviewerId = req.user.id;
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return next(errorHandler(404, "Review not found"));
        }

        if (review.reviewer.toString() !== reviewerId) {
            return next(errorHandler(403, "Not allowed"));
        }

        review.isDeleted = true;
        review.status = "deleted";

        await review.save();

        return res.status(200).json({
            success: true,
            message: "Review deleted",
        });
    } catch (error) {
        return next(errorHandler(500, error.message || "Internal Server Error"));
    }
};

export default deleteReview;