import { registerUser, logUser, getProfile } from "../services/authService.js";

const signUpUser = async (req, res) => {
    try {
        const data = req.body;
        const result = await registerUser(data);
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "User registration failed",
            data: null,
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const data = req.body;
        const result = await logUser(data);
        res.status(200).json({
            success: true,
            message: "Login successful",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Login failed",
            data: null,
        });
    }
};

const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const result = await getProfile(userId);
        res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            data: result,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || "Failed to fetch profile",
            data: null,
        });
    }
};

export { signUpUser, loginUser, getMe };




