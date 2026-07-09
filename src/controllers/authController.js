import * as AuthService from "../services/authService.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import { completeProfile} from "../services/authService.js";
// import { verify } from "jsonwebtoken";


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

//for forgot password first we need to send the otp to the user email and then verify the otp and then allow them to change the password without current password
//controller will be first we will take the email from the user and then send the otp to the email and then verify the otp and then allow them to change the password without current password




const forgotPasswordController = catchAsync(async (req, res, next) => {
    const { email } = req.body;
    console.log("Email received in forgotPasswordController:", email);
    const result = await AuthService.forgotPasswordService(email);

    console.log("Result from forgotPasswordService:", result);

    //otp sent to email successfully, now we will send the response to the user and then we will verify the otp and then allow them to change the password without current password

    // await AuthService.otpVerificationService(email, req.body.otp);
    
    res.status(200).json({
        status: "success",
        message: "OTP sent to email successfully",
        data: result,

    });

}
);

//now verify the otp as user enters the otp 
const verifyOtpController = catchAsync(async (req, res, next) => {
    const otp = req.body.otp;
    //email is required to verify the otp as we have sent the otp to the email, so we need to verify the otp with the email
    const email = req.body.email;
    const result = await AuthService.otpVerificationService(email, otp);

    res.status(200).json({
        status: "success",
        message: "OTP verified successfully",
        data: result,
    }); 
})

const resetPasswordController = catchAsync(async (req, res, next) => {
    
    const { email, newPassword } = req.body;

    console.log("Email received in resetPasswordController:", email);
    console.log("New password received in resetPasswordController:", newPassword);
    const result = await AuthService.resetPasswordService(email, newPassword);
    
    res.status(200).json({
        status: "success",
        message: "Password reset successfully",
        data: result,
    });
})



export { signUpUser, loginUser, completeProfile, getMe, changeProfile, forgotPasswordController, verifyOtpController,resetPasswordController };
