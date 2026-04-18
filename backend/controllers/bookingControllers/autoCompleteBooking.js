import cron from "node-cron";
import Booking from "../../models/Booking.js";

const autoCompleteBookings = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      console.log(" Running auto-complete job...");

      const result = await Booking.updateMany(
        {
          status: "inProgress",
          otpVerified: true,
          workDate: {
            $lte: new Date(Date.now() - 8 * 60 * 60 * 1000),
          },
        },
        { $set: { status: "completed" } }
      );

      console.log(` Auto-completed ${result.modifiedCount} bookings`);
    } catch (error) {
      console.error(" Auto-complete error:", error.message);
    }
  });
};

export default autoCompleteBookings;