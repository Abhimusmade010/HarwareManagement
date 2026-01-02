
import dotenv from "dotenv";
dotenv.config();

import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

const registerUser= async (data)=>{
    // const {Name,Email,CabinNo,Password}=data;
    // const existingUser= await User.findOne({Email});
    // if(existingUser){
    //     throw new Error("User already exists");
    // }
    // const hashedPassword= await bcrypt.hash(Password,10);
    // const newUser= new User({
    //     Name:Name,
    //     Email:Email,
    //     CabinNo:CabinNo,
    //     Password:hashedPassword,
    //     Role:"user"
    // });
    // await newUser.save();
    // return {
    //     message:"User registered successfully",
    //     userId:newUser._id

    // };

    const {Name,Email,CabinNo,Password}=data;

    const existingUser=await User.findOne({Email});

    if(existingUser){
        throw new Error ("User already exist with same email id");
    }
    const hashPassword=await bcrypt.hash(Password,10);
    const newUser=new User({
        Name:Name,
        Email:Email,
        CabinNo:CabinNo,
        Password:hashPassword,
        Role:"user"
    })
    await newUser.save();

    return {
        id:newUser._id,
        Name:newUser.Name,
        Email:newUser.Email,
        CabinNo:newUser.CabinNo,
    };
}

const logUser=async (data)=>{
    const {Email,Password}=data;

    //check if user exist or not
    const user=await User.findOne({Email});
    if(!user){
        throw new Error("User not found!!");
    }

    //compare with the password

    const isMatch=await bcrypt.compare(Password,user.Password);
    if(!isMatch){
        throw new Error("Invalid Password");

    }
    
    //generate the token

    const token =jwt.sign(
       { 
        userId:user._id,
        role:user.Role
    },
    process.env.JWT_SECRET_KEY,
    {expiresIn:"1d"}
    );


    return {
        message:"Login successfull",
        token,
        user:{
            id:user._id,
            Name:user.Name,
            Email:user.Email,
            Role:user.Role
        }
    };

};


const getProfile=async (userId)=>{
    if(!userId){
        throw new Error("User Id is required");
    }
    const user=await User.findById(userId).select("-Password");
    if(!user){
        throw new Error("User not found");
    }
    // console.log(user)
    return user;
};


export {registerUser,logUser,getProfile};