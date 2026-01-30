import jwt from "jsonwebtoken";

const maintenanceAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  console.log("inside maintanceAuth:",token);
  if (!token) {
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.MAINTENANCE_SECRET);

    if (decoded.access !== "maintenance") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export {maintenanceAuth}
