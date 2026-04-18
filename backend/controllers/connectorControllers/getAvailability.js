import User from "../../models/User.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const getAvailability = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("availability");

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    res.status(200).json({
      success: true,
      isAvailable: user.availability?.isAvailable || false,
      date: user.availability?.date || null,
    });

  } catch (error) {
    next(errorHandler(500, error.message || "Internal Server Error"));
  }
};

export default getAvailability;