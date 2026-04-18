import User from "../../models/User.js";
import Review from "../../models/Review.js";
import mongoose from "mongoose";

const updatePartnerRating = async (userId) => {
  try {
    const objectUserId = new mongoose.Types.ObjectId(userId);

    const stats = await Review.aggregate([
      {
        $match: {
          reviewedUser: objectUserId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$reviewedUser",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const avgRating = stats.length > 0 ? stats[0].avgRating : 0;
    const totalReviews = stats.length > 0 ? stats[0].totalReviews : 0;

    await User.findByIdAndUpdate(userId, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews,
    });

  } catch (error) {
    console.error("Rating update failed:", error);
  }
};

export default updatePartnerRating;