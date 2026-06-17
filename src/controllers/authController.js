import * as AuthService from "../services/authService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { completeProfile} from "../services/authService.js";

const signUpUser = catchAsync(async (req, res, next) => {

    const result = await AuthService.registerUser(req.body);
    res.status(201).json({
        status: "success",
        message: "User created successfully",
        data: result,
    });
});

const loginUser = catchAsync(async (req, res, next) => {
    const result = await AuthService.logUser(req.body);
    res.status(200).json({
        status: "success",
        message: "Login successful",
        data: result,
    });
});


// const completeProfile = catchAsync(async (req, res, next) => {
//     const userId = req.user._id;
//     const result = await AuthService.completeProfile(userId, req.body);

//     res.status(200).json({
//         status: "success",
//         message: "Profile completed successfully",
//         data: result,
//     });
// }); 

const getMe = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const user = await AuthService.getProfile(userId);

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: "success",
        data: { user },
    });
});

const changeProfile = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const result = await AuthService.completeProfile(userId, req.body);

    res.status(200).json({
        status: "success",
        message: "Profile updated successfully",
        data: result,
    });
});

export { signUpUser, loginUser, completeProfile, getMe, changeProfile };
