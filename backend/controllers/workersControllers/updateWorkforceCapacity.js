import WorkforceCapacity from "../../models/WorkforceCapacity.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const updateWorkers = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { skill, count, wage } = req.body;

        const workers = await WorkforceCapacity.findById(id);

        if (!workers) {
            return next(errorHandler(404, "Worker not found"));
        }

        if (workers.connectorId.toString() !== req.user.id.toString()) {
            return next(errorHandler(403, "Not authorized to update this worker"));
        }

        if (count !== undefined && count < 0) {
            return next(errorHandler(400, "Count cannot be negative"));
        }

        if (wage !== undefined && wage < 0) {
            return next(errorHandler(400, "Wage cannot be negative"));
        }

        if (skill) workers.skill = skill;
        if (count !== undefined) workers.count = count;
        if (wage !== undefined) workers.wage = wage;

        const updatedWorker = await workers.save();

        res.status(200).json({
            success: true,
            message: "Workers updated successfully",
            data: updatedWorker,
        });
    } catch (error) {
        return next(errorHandler(500, error.message || "Internal Server Error"));
    }
};

export default updateWorkers;