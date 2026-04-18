import cron from "node-cron";
import Booking from "../../models/Booking.js";
import WorkforceCapacity from "../../models/WorkforceCapacity.js";

const autoCancelBookings = () => {
  // Runs every day at 12:00 AM
  cron.schedule("0 0 * * *", async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const bookings = await Booking.find({
        workDate: { $lt: today },
        status: { $in: ["pending", "accepted"] },
      });

      for (const booking of bookings) {
        // Restore worker count (connector flow)
        if (booking.workers && booking.workers.length > 0) {
          for (const w of booking.workers) {
            const workersDoc = await WorkforceCapacity.findById(w.worker);
            if (workersDoc) {
              workersDoc.count += w.count;
              await workersDoc.save();
            }
          }
        }

        // Cancel booking
        booking.status = "cancelled";
        booking.otp = null;
        booking.otpVerified = false;

        await booking.save();
      }

      console.log("Auto-cancel cron executed");
    } catch (error) {
      console.error("Cron error:", error.message);
    }
  });
};

export default autoCancelBookings;