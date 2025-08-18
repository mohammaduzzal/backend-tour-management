import z from "zod";
import { GRole } from "./guide.interface";

export const createGuideZodSchema = z.object({
    user : z.string(),
    nidPhoto : z.string().optional(),
    division : z.string(),
})


export const updateGuideZodSchema = z.object({
    status : z.enum(Object.values(GRole) as [string])
})