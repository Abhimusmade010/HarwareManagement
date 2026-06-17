// import { assign } from "nodemailer/lib/shared";
import { z } from "zod";

// const comSchema=z.object({

//     // title: z.string().trim().min(3, "Title too short"),z.coerce.number()
//     assetId: z.coerce.number().int("Asset ID must be an integer").positive("Asset ID must be positive"),
//     description:z.string().min(10),
//     category: z.enum(["Hardware", "Network", "Software", "Other"]),
//     // assignedTo: z.string().min(3) , // this will be the manager's name or id, we can decide later
//     priority: z.enum(["Low", "Medium", "High"])

// })
const comSchema = z.object({
    assetId: z.coerce
        .number()
        .int("Asset ID must be an integer")
        .positive("Asset ID must be positive"),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters"),

    category: z.enum([
        "Hardware",
        "Software"
    ]),

    priority: z.enum([
        "Low",
        "Medium",
        "High"
    ])
});

export {comSchema};