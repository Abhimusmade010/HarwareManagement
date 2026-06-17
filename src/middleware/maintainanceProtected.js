import { protect, restrictTo } from "./authMiddleware.js";

const maintenanceAuth = (req, res, next) => {
  protect(req, res, (err) => {
    if (err) {
      return next(err);
    }

    return restrictTo("maintainance")(req, res, next);
  });
};

export {maintenanceAuth}
