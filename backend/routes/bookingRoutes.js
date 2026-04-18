import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import createBooking from "../controllers/bookingControllers/createBooking.js";
import getUserBookings from "../controllers/bookingControllers/getUserBookings.js";
import getBooking from "../controllers/bookingControllers/getBooking.js";
import acceptBooking from "../controllers/bookingControllers/acceptBooking.js";
import verifyOTP from "../controllers/bookingControllers/verifyOTP.js";
import getPartnerBookings from "../controllers/bookingControllers/getPartnerBookings.js";
import cancelBooking from "../controllers/bookingControllers/cancelBooking.js";
import autoCancelOldBookings from "../controllers/bookingControllers/autoCancellOldBookings.js";
import getOTP from "../controllers/bookingControllers/getOTP.js";
import completeBooking from "../controllers/bookingControllers/completeBooking.js";

const router = express.Router();

router.post("/create", verifyToken,createBooking);
router.get("/all",verifyToken,getUserBookings);
router.get("/partner/all",verifyToken,getPartnerBookings)
router.get("/:bookingId",verifyToken,getBooking);
router.post("/cancel/:bookingId",verifyToken,cancelBooking);
router.post("/auto-cancel-old",autoCancelOldBookings);
router.post("/complete/:bookingId",verifyToken,completeBooking);

router.post("/accept/:bookingId",verifyToken,acceptBooking);
router.get("/get-otp/:bookingId",verifyToken,getOTP);
router.post("/verify/:bookingId",verifyToken,verifyOTP);

export default router;