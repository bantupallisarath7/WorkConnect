import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        partnerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // connector or worker
            required: true,
        },

        partnerName:{
            type:String,
        },
        // through connector 
        workers: [
            {
                worker: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "WorkforceCapacity",
                    required: true,
                },
                skill: String,
                wage: Number,

                count: {
                    type: Number,
                    required: true,
                },
            },
        ],

        // through direct individual worker
        workerDetails:{
            skill: String,
            experience:Number,
            wage:Number
        },

        address: {
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

        contactName: {
            type: String,
            required: true,
            trim: true,
        },

        contactPhone: {
            type: String,
            required: true,
        },

        mealsProvided: {
            type: Boolean,
            default: false,
        },

        travelCharges: {
            type: Number,
            default: 0,
        },

        labourCost: {
            type: Number,
            required: true,
        },
        commission:{
            type:Number,
            required:true
        },
        totalAmount: {
            type: Number,
            required: true,
        },

        paymentMethod: {
            type: String,
            enum: ["cash", "upi", "bank"],
            default: "cash",
        },

        notes: {
            type: String,
            default: "",
        },

        bookingDate: {
            type: Date,
            default: Date.now,
        },

        workDate: {
            type: Date,
        },

        status: {
            type: String,
            enum: ["pending", "accepted","inProgress","completed", "cancelled"],
            default: "pending",
        },
        otp: {
            code: String,
            plain: String, 
        },
        otpVerified: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);