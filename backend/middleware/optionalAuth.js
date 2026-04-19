import jwt from "jsonwebtoken";

const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies?.access_token;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    req.user = null; 
    next();
  }
};

export default optionalAuth;