import express from "express"
import signup from "../controllers/authControllers/signup.js";
import signin from "../controllers/authControllers/signin.js";
import signout from "../controllers/authControllers/signout.js";
import verifyOTP from "../controllers/authControllers/verifyOTP.js";
import otpLimiter from "../middleware/otpLimiter.js";
import resendOTP from "../controllers/authControllers/resendOTP.js";
import forgotPassword from "../controllers/authControllers/forgotPassword.js";
import resetPassword from "../controllers/authControllers/resetPassword.js";

const router = express.Router();

router.post("/signup",signup);
router.post("/signin",signin);
router.post("/signout",signout);
router.post("/verify-otp",verifyOTP);
router.post("/resend-otp",otpLimiter,resendOTP);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


export default router;