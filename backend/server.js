import express from "express";
import dotEnv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import connectorRoutes from "./routes/connectorRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import "./utils/availabilityCron.js";
import autoCompleteBookings from "./controllers/bookingControllers/autoCompleteBooking.js";
import autoCancelBookings from "./controllers/bookingControllers/autoCancellOldBookings.js";


const app = express();
dotEnv.config()
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'https://work-connect-seven.vercel.app',
    credentials: true
}))

app.use("/api/auth", authRoutes);
app.use("/api/user",userRoutes);
app.use("/api/booking",bookingRoutes);
app.use("/api/connector",connectorRoutes);
app.use("/api/review",reviewRoutes);

autoCompleteBookings();
autoCancelBookings();

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    })
})

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Mongodb connected successfully"))
    .catch((err) => console.log(err));

app.listen(process.env.PORT, () => {
    console.log("Server started successfully");
})