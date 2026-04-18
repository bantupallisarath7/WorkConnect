import WorkforceCapacity from "../../models/WorkforceCapacity.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const deleteWorkforceCapacity = async (req, res, next) => {
    try {
        const { id } = req.params;

        const workers = await WorkforceCapacity.findById(id);

        if (!workers) {
            return next(errorHandler(404, "Worker not found"));
        }

        if (workers.connectorId.toString() !== req.user.id.toString()) {
            return next(errorHandler(403, "Not authorized to delete this worker"));
        }

        await workers.deleteOne();

        res.status(200).json({
            success: true,
            message: "Worker deleted successfully",
        });
    } catch (error) {
        return next(errorHandler(500, error.message || "Internal Server Error"));
    }
};

export default deleteWorkforceCapacity;