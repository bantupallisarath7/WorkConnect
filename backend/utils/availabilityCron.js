import cron from "node-cron";
import User from "../models/User.js";
import errorHandler from "../errorHandler/errorHandler.js";

console.log("Availability Cron Loaded");

const resetAvailability = async () => {
  try {
    const result = await User.updateMany(
      {
        role: { $in: ["worker", "connector"] },
        "availability.isAvailable": true,
      },
      {
        $set: {
          "availability.isAvailable": false,
          "availability.date": null,
        },
      }
    );

    return result;

  } catch (error) {
    throw new Error(error.message || "Failed to reset availability");
  }
};

cron.schedule(
    "0 0 * * *",
    async () => {
        try {
            console.log("Running availability reset cron...");

            const result = await resetAvailability();

            if (result.modifiedCount === 0) {
                console.log("No users needed reset");
            } else {
                console.log(
                    `Reset done: ${result.modifiedCount} users updated`
                );
            }

        } catch (error) {
            console.error(
                "Cron Error:",
                error.message || "Something went wrong"
            );
        }
    },
    {
        timezone: "Asia/Kolkata",
    }
);