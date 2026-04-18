import express from "express";
import getProfile from "../controllers/userControllers/getProfile.js";
import verifyToken from "../middleware/verifyToken.js";
import updateProfile from "../controllers/userControllers/updateProfile.js";
import searchPartners from "../controllers/userControllers/searchPartners.js";



const router = express.Router();

router.get("/profile",verifyToken,getProfile);
router.put("/profile",verifyToken,updateProfile);
router.get("/search/connectors", searchPartners);




export default router