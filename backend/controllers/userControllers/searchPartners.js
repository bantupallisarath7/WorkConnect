import errorHandler from "../../errorHandler/errorHandler.js";
import User from "../../models/User.js";

const searchPartners = async (req, res, next) => {
  try {
    let {
      search = "",
      city,
      minRating,
      minWage,
      maxWage,
      minExperience,
      page = 1,
      limit = 10,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const regex = new RegExp(search.trim(), "i");

    const pipeline = [];

    pipeline.push({
      $match: {
        role: { $in: ["worker", "connector"] },
      },
    });

    pipeline.push({
      $lookup: {
        from: "workforcecapacities",
        localField: "_id",
        foreignField: "connectorId",
        as: "workforce",
      },
    });

    pipeline.push({
      $addFields: {
        workforce: {
          $filter: {
            input: "$workforce",
            as: "w",
            cond: { $gt: ["$$w.count", 0] }, // important
          },
        },
      },
    });

    if (search.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { name: regex },
            { "skills.name": regex },     // worker
            { "workforce.skill": regex }, // connector
          ],
        },
      });
    }

    if (city) {
      pipeline.push({
        $match: {
          "location.city": {
            $regex: new RegExp(`^${city.trim()}$`, "i"),
          },
        },
      });
    }

    if (minRating) {
      pipeline.push({
        $match: {
          rating: { $gte: Number(minRating) },
        },
      });
    }

    if (minExperience) {
      pipeline.push({
        $match: {
          $or: [
            { role: "connector" }, // skip connectors
            { experience: { $gte: Number(minExperience) } },
          ],
        },
      });
    }

    if (minWage || maxWage) {
      pipeline.push({
        $addFields: {
          // Worker skills filter
          skills: {
            $filter: {
              input: "$skills",
              as: "s",
              cond: {
                $and: [
                  ...(minWage
                    ? [{ $gte: ["$$s.wage", Number(minWage)] }]
                    : []),
                  ...(maxWage
                    ? [{ $lte: ["$$s.wage", Number(maxWage)] }]
                    : []),
                ],
              },
            },
          },

          // Connector workforce filter
          workforce: {
            $filter: {
              input: "$workforce",
              as: "w",
              cond: {
                $and: [
                  ...(minWage
                    ? [{ $gte: ["$$w.wage", Number(minWage)] }]
                    : []),
                  ...(maxWage
                    ? [{ $lte: ["$$w.wage", Number(maxWage)] }]
                    : []),
                ],
              },
            },
          },
        },
      });
    }

    pipeline.push({
      $match: {
        $or: [
          // WORKER: must be available + have skills
          {
            role: "worker",
            "availability.isAvailable": true,
            "skills.0": { $exists: true },
          },

          {
            role: "connector",
            "availability.isAvailable": true,
            "workforce.0": { $exists: true },
          },
        ],
      },
    });

    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        role: 1,
        rating: 1,
        totalJobs: 1,
        experience: 1,
        location: 1,
        commissionRate: 1,

        // Worker skills
        skills: {
          $map: {
            input: "$skills",
            as: "s",
            in: {
              name: "$$s.name",
              wage: "$$s.wage",
              experience: "$$s.experience",
            },
          },
        },

        // Connector workforce
        workers: {
          $map: {
            input: "$workforce",
            as: "w",
            in: {
              _id: "$$w._id",
              skill: "$$w.skill",
              wage: "$$w.wage",
              count: "$$w.count",
            },
          },
        },
      },
    });

    pipeline.push({
      $sort: {
        rating: -1,
        totalJobs: -1,
      },
    });

    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const results = await User.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });

  } catch (error) {
    next(errorHandler(500, error.message || "Internal Server Error"));
  }
};

export default searchPartners;