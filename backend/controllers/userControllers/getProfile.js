import User from "../../models/User.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "name email role phone profileImage location availability rating totalJobs commissionRate skills"
    );

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profileImage: user.profileImage,

        location: {
          addressLine: user.location?.addressLine,
          city: user.location?.city,
          state: user.location?.state,
          pincode: user.location?.pincode,
          country: user.location?.country,
        },

        availability: {
          isAvailable: user.availability?.isAvailable,
        },

        rating: user.rating,
        totalJobs: user.totalJobs,

        // ✅ Only expose for connector
        ...(user.role === "connector" && {
          commissionRate: user.commissionRate,
        }),
        // Only expose for worker
        ...(user.role === "worker" && {
          skills:user.skills || [],
        })
      },
    });

  } catch (error) {
    next(errorHandler(500, error.message || "Internal Server Error"));
  }
};

export default getProfile;