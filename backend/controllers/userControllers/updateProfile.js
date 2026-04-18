import User from "../../models/User.js";
import errorHandler from "../../errorHandler/errorHandler.js";

const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const {
            name,
            phone,
            location,
            profileImage,
            skills,
            experience,
            commissionRate,
        } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return next(errorHandler(404, "User not found"));
        }

        // BASIC FIELDS
        if (name) user.name = name.trim();
        if (phone) user.phone = phone;
        if (profileImage) user.profileImage = profileImage;

        // LOCATION (merge safely)
        if (location) {
            user.location = {
                ...user.location,
                ...location,
            };
        }

        // EXPERIENCE
        if (experience !== undefined) {
            user.experience = Number(experience) || 0;
        }

        //  WORKER: SKILLS HANDLING
        if (user.role === "worker") {
            if (skills) {
                // 🔥 Clean + normalize skills
                const cleanedSkills = skills
                    .filter(
                        (s) =>
                            s.name &&
                            s.name.trim() !== ""
                    )
                    .map((s) => ({
                        name: s.name.trim(),
                        experience: Number(s.experience) || 0,
                        wage: Number(s.wage) || 0,
                    }));

                // Optional strict validation
                if (cleanedSkills.length === 0) {
                    return next(
                        errorHandler(400, "At least one valid skill is required")
                    );
                }

                user.skills = cleanedSkills;
            }
        } else {
            // ❌ Non-workers shouldn't have skills
            user.skills = [];
        }

        // CONNECTOR: COMMISSION
        if (user.role === "connector") {
            if (commissionRate !== undefined) {
                const rate = Number(commissionRate);

                if (isNaN(rate) || rate < 0 || rate > 100) {
                    return next(
                        errorHandler(400, "Commission must be between 0 and 100")
                    );
                }

                user.commissionRate = rate;
            }
        } else {
            user.commissionRate = 0;
        }

        // SAVE
        await user.save();

        // RETURN UPDATED USER (without password)
        const updatedUser = await User.findById(userId).select("-password");

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser,
        });

    } catch (error) {
        next(errorHandler(500, error.message || "Internal Server Error"));
    }
};

export default updateProfile;