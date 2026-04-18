import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import createReview from "../controllers/reviewControllers/createReview.js";
import getUserReviews from "../controllers/reviewControllers/getUserReview.js";
import updateReview from "../controllers/reviewControllers/updateReview.js";
import deleteReview from "../controllers/reviewControllers/deleteReview.js";
import markHelpful from "../controllers/reviewControllers/markHelpful.js";
import reportReview from "../controllers/reviewControllers/reportReview.js";
import getMyIncomingReviews from "../controllers/reviewControllers/getMyIncomingReviews.js";
import getPartnerReviews from "../controllers/reviewControllers/getPartnerReviews.js";

const router = express.Router();

router.post("/",verifyToken,createReview);
router.get("/user/:userId",getUserReviews);
router.put("/:reviewId",verifyToken,updateReview);
router.delete("/:reviewId",verifyToken,deleteReview);
router.patch("/:reviewId/helpful", verifyToken, markHelpful);
router.patch("/:reviewId/report", verifyToken, reportReview);
router.get("/all",verifyToken,getMyIncomingReviews);
router.get("/partner/:userId",verifyToken,getPartnerReviews);

export default router;