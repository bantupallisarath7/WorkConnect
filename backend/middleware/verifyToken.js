import jwt from "jsonwebtoken";
import errorHandler from "../errorHandler/errorHandler.js";

const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies?.access_token;

        if (!token) {
            return next(errorHandler(401, "Access denied. No token provided."));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(errorHandler(401, "Token expired. Please login again."));
        }

        return next(errorHandler(403, "Invalid token."));
    }
};

export default verifyToken;