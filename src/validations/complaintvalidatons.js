import { z } from "zod";

const comSchema=z.object({

    // title: z.string().trim().min(3, "Title too short"),z.coerce.number()
    assetId: z.coerce.number().int("Asset ID must be an integer").positive("Asset ID must be positive"),
    description:z.string().min(10),
    category: z.enum(["Hardware", "Network", "Software", "Other"]),
    priority: z.enum(["Low", "Medium", "High"])

})

export {comSchema};