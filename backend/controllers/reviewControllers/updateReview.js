import errorHandler from "../../errorHandler/errorHandler.js";
import Review from "../../models/Review.js";

const updateReview = async (req, res, next) => {
    try {
        const reviewerId = req.user.id;
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review || review.isDeleted) {
            return next(errorHandler(404, "Review not found"));
        }

        // only owner can edit
        if (review.reviewer.toString() !== reviewerId) {
            return next(errorHandler(403, "Not allowed"));
        }

        const allowedUpdates = ["rating", "comment", "tags"];

        allowedUpdates.forEach((field) => {
            if (req.body[field] !== undefined) {
                review[field] = req.body[field];
            }
        });

        await review.save();

        return res.status(200).json({
            success: true,
            message: "Review updated",
            review,
        });
    } catch (error) {
        return next(errorHandler(500, error.message || "Internal Server Error"));
    }
};

export default updateReview;