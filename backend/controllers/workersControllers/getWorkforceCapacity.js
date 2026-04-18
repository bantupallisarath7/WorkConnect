import WorkforceCapacity from "../../models/WorkforceCapacity.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const getWorkforceCapacity = async (req, res, next) => {
    try {
        const { connectorId } = req.params;

        if (!connectorId) {
            return next(errorHandler(400, "Connector ID is required"));
        }

        const workers = await WorkforceCapacity.find({ connectorId: connectorId }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            count: workers.length,
            data: workers,
        });
    } catch (error) {
        return next(errorHandler(500, error.message || "Internal Server Error"));
    }
};

export default getWorkforceCapacity;