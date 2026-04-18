import User from "../../models/User.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const updateAvailability = async (req, res, next) => {
    
  try {
    const userId = req.user.id;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return next(errorHandler(400, "Invalid availability value"));
    }

    const user = await User.findById(userId);

    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    if (user.role === "user") {
      return next(
        errorHandler(403, "Users are not allowed to update availability")
      );
    }

    const today = new Date().toISOString().split("T")[0];

    user.availability = {
      isAvailable,
      date: isAvailable ? today : null,
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      availability: user.availability,
    });

  } catch (error) {
    next(errorHandler(500, error.message || "Internal Server Error"));
  }
};

export default updateAvailability;