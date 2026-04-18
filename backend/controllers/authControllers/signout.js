import errorHandler from "../../errorHandler/errorHandler.js";

const signout = async (req, res, next) => {
    try {
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        next(errorHandler(500, "Logout failed"));
    }
};

export default signout;