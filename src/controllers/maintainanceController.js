import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import * as AuthService from "../services/authService.js";

const changePassword = catchAsync(
    async (req, res) => {

        const result =
            await AuthService.changePassword(
                req.user._id,
                req.body
            );

        res.status(200).json({
            status: "success",
            message: result.message
        });

    }
);


export { changePassword };
