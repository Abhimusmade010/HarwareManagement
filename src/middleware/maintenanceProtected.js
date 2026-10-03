import { protect, restrictTo } from "./authMiddleware.js";
import { ROLES } from "../constants/roles.js";

const maintenanceAuth = (req, res, next) => {
  protect(req, res, (err) => {
    if (err) {
      return next(err);
    }

    return restrictTo(ROLES.MAINTENANCE)(req, res, next);
  });
};

export { maintenanceAuth };
