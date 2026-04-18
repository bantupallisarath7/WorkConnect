import Review from "../../models/Review.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const getUserReviews = async (req, res, next) => {
    try {
        const { userId } = req.user.id;

        const reviews = await Review.find({
            reviewedUser: userId,
            isDeleted: false,
            status: "visible",
        })
            .populate("reviewer", "name profileImage")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success:true,
            total: reviews.length,
            reviews,
        });
    } catch (error) {
        return next(errorHandler(500, error.message || "Internal Server Error"));
    }
};

export default getUserReviews;