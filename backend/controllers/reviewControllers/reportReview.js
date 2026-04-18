import Review from "../../models/Review.js";
import errorHandler from "../../errorHandler/errorHandler.js";
const reportReview = async (req, res, next) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return next(errorHandler(404, "Review not found"));
        }

        review.status = "reported";

        await review.save();

        return res.status(200).json({
            success: true,
            message: "Review reported",
        });
    } catch (error) {
        return next(errorHandler(500, error.message || "Internal Server Error"));
    }
};
export default reportReview;