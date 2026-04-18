import User from "../../models/User.js";
import Worker from "../../models/WorkforceCapacity.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const getTopConnectors = async (req, res, next) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        connectors: [],
        message: "City is required",
      });
    }

    //  Get top connectors
    const connectors = await User.find({
      role: "connector",
      "location.city": {
        $regex: new RegExp(`^${city.trim()}$`, "i"),
      },
      "availability.isAvailable": true,
    })
      .select("name profileImage rating totalJobs location.city availability.isAvailable commissionRate")
      .sort({ rating: -1 })
      .limit(6)
      .lean();

    const connectorIds = connectors.map((c) => c._id);

    //  Get all workers in ONE query
    const workers = await Worker.find({
      connectorId: { $in: connectorIds },
    }).lean();

    //  Group workers by connectorId
    const workerMap = {};

    workers.forEach((w) => {
      const id = w.connectorId.toString();
      if (!workerMap[id]) workerMap[id] = [];
      workerMap[id].push(w);
    });

    //  Attach workers
    const connectorsWithWorkers = connectors.map((c) => ({
      ...c,
      workers: workerMap[c._id.toString()] || [],
    }));

    res.status(200).json({
      success: true,
      connectors: connectorsWithWorkers,
    });

  } catch (error) {
    next(errorHandler(500, error.message || "Internal Server Error"));
  }
};

export default getTopConnectors;