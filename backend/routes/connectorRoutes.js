import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import updateAvailability from "../controllers/connectorControllers/updateAvailability.js";
import getAvailability from "../controllers/connectorControllers/getAvailability.js";
import createWorker from "../controllers/workersControllers/createWorkforceCapacity.js";
import updateWorkers from "../controllers/workersControllers/updateWorkforceCapacity.js";
import getWorkers from "../controllers/workersControllers/getWorkforceCapacity.js";
import deleteWorker from "../controllers/workersControllers/deleteWorkforceCapacity.js";
import getTopConnectors from "../controllers/connectorControllers/getTopConnectors.js";
import getTopWorkers from "../controllers/workerControllers/getTopWorkers.js";

const router = express.Router();

router.put("/availability", verifyToken, updateAvailability);
router.get("/availability",verifyToken,getAvailability);
router.get("/top-connectors",verifyToken,getTopConnectors);
router.get("/top-workers",getTopWorkers);

router.post("/workers/create", verifyToken, createWorker);
router.put("/workers/:id",verifyToken,updateWorkers);
router.get("/workers/:connectorId",verifyToken,getWorkers);
router.delete("/workers/:id",verifyToken,deleteWorker);

export default router