import jwt from "jsonwebtoken";


const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Access denied. Invalid token format.",
      });
    }
    console.log("Secret is :",process.env.JWT_SECRET_KEY)
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };


    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

export default authMiddleware;
