import { maintenanceLogin } from "../services/maintainanceService.js";

const maintenanceLoginController = async (req, res) => {
    try {
        const data = req.body;
        const result = await maintenanceLogin(data);
        res.status(200).json({
            success: true,
            message: "Maintenance login successful",
            data: result,
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message || "Maintenance login failed",
            data: null,
        });
    }
};

export { maintenanceLoginController };

