import mongoose from "mongoose";

const workforceCapacitySchema = new mongoose.Schema(
    {
        connectorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        skill: {
            type: String,
            required: true,
        },

        count: {
            type: Number,
            required: true,
        },

        wage: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("WorkforceCapacity", workforceCapacitySchema);