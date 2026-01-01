import { z } from "zod";

const comSchema=z.object({

    title: z.string().trim().min(3, "Title too short"),
    description:z.string().min(10),
    category: z.enum(["Hardware", "Network", "Software", "Other"]),
    priority: z.enum(["Low", "Medium", "High"])

})

export {comSchema};