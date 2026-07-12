import { catchAsync } from "../utils/catchAsync.js";
// export {createMaintenanceUser};
// import { createMaintenanceUser, getMaintenanceEngineersWithStats } from "../services/adminService.js";

import * as AdminService from "../services/adminService.js";


const createMaintenanceUserController = async (req, res) => {
    
    try {

        const data = req.body;
        const result = await AdminService.createMaintenanceUser(data);

        res.status(200).json({

            success: true,
            message: "Maintenance user created successfully",
            data: result,
            
        });

    } 
    catch (error) {
        
        res.status(401).json({
            success: false,
            message: error.message || "Maintenance login failed",
            data: null,
        });

    }
};

const getMaintenanceEngineersController = catchAsync(async (req, res) => {
    const engineers = await AdminService.getMaintenanceEngineersWithStats();
    
    res.status(200).json({
        success: true,
        message: "Maintenance engineers fetched successfully",
        data: engineers,
    });
});

const getManagerReviewsController = catchAsync(async (req, res) => {
    const managerId = req.params.managerId;
    const reviews = await AdminService.getManagerReviews(managerId);
    res.status(200).json({
        success: true,
        data: reviews,
    });
});

export { createMaintenanceUserController, getMaintenanceEngineersController, getManagerReviewsController };