import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            unique: true,
            sparse: true,
        },

        password: {
            type: String,
        },
        resetPasswordToken: String,
        resetPasswordExpires: Date,
        phone: {
            type: String,
            unique: true,
            sparse: true,
        },

        role: {
            type: String,
            enum: ["user", "worker", "connector"],
            required: true,
        },
        location: {
            addressLine: {
                type: String,
                trim: true,
            },
            city: {
                type: String,
                trim: true,
            },
            state: {
                type: String,
                trim: true,
            },
            pincode: {
                type: String,
                trim: true,
            },
            country: {
                type: String,
                default: "India",
            },
        },

        profileImage: {
            type: String,
            default: "",
        },
        skills: [
            {
                name: {
                    type: String,
                    required: true,
                },
                experience: {
                    type: Number,
                    default: 0,
                },
                wage: {
                    type: Number,
                    default: 0,
                },
            },
        ],
        experience: {
            type: Number,
            default: 0,
        },
        availability: {
            isAvailable: {
                type: Boolean,
                default: false,
            },
            date: {
                type: String,
            },
        },

        rating: {
            type: Number,
            default: 2,
        },
        commissionRate: {
            type: Number,
            default: 0,
        },

        totalJobs: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (this.role === "user") {
        this.skills = [];
        this.experience = 0;
        this.availability = {
            isAvailable: false,
            date: null,
        };
        this.commissionRate = 0;
    }

    // Reset for workers
    if (this.role === "worker") {
        this.commissionRate = 0;
    }
});

export default mongoose.model("User", userSchema);