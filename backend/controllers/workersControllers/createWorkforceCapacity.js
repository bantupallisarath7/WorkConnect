import WorkforceCapacity from "../../models/WorkforceCapacity.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const createWorkforceCapacity = async (req, res, next) => {
    try {
        const { skill, count, wage } = req.body;

        if (!skill || !count || !wage) {
            return next(errorHandler(400,"All fields are required"));
        }

        const workers = await WorkforceCapacity.create({
            connectorId: req.user.id,
            skill,
            count,
            wage,
        });

        res.status(201).json({
            success: true,
            message: "Worker created successfully",
            data: workers,
        });
    } catch (error) {
        next(errorHandler(500,error.message || "Internal Server Error"));
    }
};
export default createWorkforceCapacity;