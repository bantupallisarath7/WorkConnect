import WorkforceCapacity from "../../models/WorkforceCapacity.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const getAllWorkers = async (req, res, next) => {
  try {
    const workers = await WorkforceCapacity.find({})
      .populate("connector", "name phone") // optional but powerful
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers,
    });
  } catch (error) {
    return next(
      errorHandler(500, error.message || "Internal Server Error")
    );
  }
};

export default getAllWorkforceCapacity;