import * as AuthService from "../services/authService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { completeProfile} from "../services/authService.js";

const signUpUser = catchAsync(async (req, res, next) => {

    const result = await AuthService.registerUser(req.body);
    res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.status(201).json({
        status: "success",
        message: "User created successfully",
        data: result,
    });
});

const loginUser = catchAsync(async (req, res, next) => {
    const result = await AuthService.logUser(req.body);
    res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.status(200).json({
        status: "success",
        message: "Login successful",
        data: result,
    });
});

const getMe = catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const user = await AuthService.getProfile(userId);

    if (!user) {
        return next( AppError('No user found with that ID', 404));
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

const logoutUser = catchAsync(async (req, res, next) => {
    res.cookie('token', 'loggedout', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1 // expire immediately
    });
    res.status(200).json({ status: 'success' });
});

export { signUpUser, loginUser, completeProfile, getMe, changeProfile, logoutUser };
