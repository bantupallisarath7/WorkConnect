import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    reviewedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },


    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },


    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    reviewerRole: {
      type: String,
      enum: ["connector", "worker"],
      required: true,
    },

    status: {
      type: String,
      enum: ["visible", "hidden", "reported", "deleted"],
      default: "visible",
      index: true,
    },

    tags: [
      {
        type: String,
        enum: [
          "punctual",
          "professional",
          "skilled",
          "rude",
          "late",
          "excellent",
          "poor_quality",
        ],
      },
    ],
    helpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    helpfulCount: {
      type: Number,
      default: 0
    },

    // For soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Review", reviewSchema);