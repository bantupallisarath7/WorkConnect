import errorHandler from "../../errorHandler/errorHandler.js";
import Review from "../../models/Review.js";

const getMyIncomingReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      reviewedUser: userId,
      isDeleted: false,
      status: "visible",
    })
      .populate("reviewer", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({
      reviewedUser: userId,
      isDeleted: false,
      status: "visible",
    });

    return res.status(200).json({
    success:true,
    message:"Reviews fetched successfully",
      total,
      page,
      pages: Math.ceil(total / limit),
      reviews,
    });
  } catch (error) {
    return next(errorHandler(500,error.message || "Internal Server Error"));
  }
};

export default getMyIncomingReviews;