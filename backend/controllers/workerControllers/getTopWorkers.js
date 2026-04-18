import User from "../../models/User.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const getTopWorkers = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        workers: [],
        message: "City is required",
      });
    }

    const filter = {
      role: "worker",
      "location.city": {
        $regex: new RegExp(`^${city.trim()}$`, "i"),
      },
      "skills.0": { $exists: true },
      "availability.isAvailable": true,
    };

    const workers = await User.find(filter)
      .select(
        "name profileImage rating totalJobs location.city skills experience availability.isAvailable"
      )
      .sort({
        rating: -1,
        totalJobs: -1,
      })
      .limit(6);

    res.status(200).json({
      success: true,
      workers,
    });
  } catch (error) {
    next(errorHandler(500, error.message || "Internal Server Error"));
  }
};

export default getTopWorkers;