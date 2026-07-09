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

  Role: z
    .enum(["user", "maintainance", "admin"])
    .optional()
});

const loginSchema = z.object({
  Email: z
    .string()
    .email("Invalid email format"),

  Password: z
    .string()
    .min(6, "Password must be at least 6 characters")
});

const createMaintenanceSchema = z.object({
    Name: z.string().min(3),
    Email: z.string().email()
});



const changePasswordSchema = z.object({

    currentPassword: z
        .string()
        .min(6),

    newPassword: z
        .string()
        .min(6)

});



const profileSchema = z.object({
    MobileNo: z.string().regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
    CabinNo: z.string().max(100),
    Department: z.string().max(100),
    Specialization: z.string().max(100),
    Designation: z.string().max(100)
});


const forgotPasswordSchema = z.object({
    email: z.string().email("Invalid email format")
}); 

const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email format"),
    newPassword: z.string().min(6, "Password must be at least 6 characters")
});

export { signUpSchema, loginSchema, createMaintenanceSchema, changePasswordSchema, profileSchema, forgotPasswordSchema,resetPasswordSchema };