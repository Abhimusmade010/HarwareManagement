import { z } from "zod";


const signUpSchema = z.object({
  Name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .trim(),

  Email: z
    .string()
    .email("Invalid email format"),

  Password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  
  CabinNo: z
    .string()
    .min(1, "Cabin number is required"),
  
  Department:z.string().min(1,"Department name is required!")

});


 const loginSchema = z.object({
  Email: z
    .string()
    .email("Invalid email format"),

  Password: z
    .string()
    .min(6, "Password must be at least 6 characters")
});


export {signUpSchema,loginSchema};