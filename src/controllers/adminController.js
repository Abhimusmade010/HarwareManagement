import { catchAsync } from "../utils/catchAsync.js";
// export {createMaintenanceUser};
import { createMaintenanceUser, getMaintenanceEngineersWithStats } from "../services/adminService.js";



const createMaintenanceUserController = async (req, res) => {
    
    try {

        const data = req.body;
        const result = await createMaintenanceUser(data);

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
    const engineers = await getMaintenanceEngineersWithStats();
    
    res.status(200).json({
        success: true,
        message: "Maintenance engineers fetched successfully",
        data: engineers,
    });
});

export { createMaintenanceUserController, getMaintenanceEngineersController };