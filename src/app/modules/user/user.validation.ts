import z from "zod";
import { IsActive, Role } from "./user.interface";

 export const createUserZodSchema = z.object({
        name: z.string({invalid_type_error: "name must be string"}).min(2,{message:"name is too short.minimum 2 character long"}).max(50,{message:"name is too long.maximum 50 character long"}),

        email: z.string({invalid_type_error : "email must be string" })
        .email({message:"invalid email address format"})
        .min(5,{message : "email must be at least 5 characters long"})
        .max(100,{message:"email cannot exceed 100 characters"}),

        password: z.string().min(8)
        .regex(/^(?=.*[A-Z])/,{
            message:"password must contain at least 1 uppercase",
        })
        .regex(/^(?=.*[!@#$%^&*])/,{
            message : "password must contain at least 1 special character",
        })
        .regex(/^(?=.*\d)/,{
            message: "password must contain at least 1 number",
        }),

        phone: z.
        string({invalid_type_error : "phone number must be string"})
        .regex(/^(?:\+8801\d{9})$/,{
            message : "phone number must valid for bangladesh.format: +8801XXXXXXXXX or 01XXXXXXXXX"
        }).optional()
        ,

        address: z.string({invalid_type_error : "address must be string"})
        .max(200,{message: "address can not exceed 200 characters"})
        .optional()
    })

 export const updateUserZodSchema = z.object({
        name: z.string({invalid_type_error: "name must be string"}).min(2,{message:"name is too short.minimum 2 character long"}).max(50,{message:"name is too long.maximum 50 character long"}).optional(),

        phone: z.
        string({invalid_type_error : "phone number must be string"})
        .regex(/^(?:\+8801\d{9})$/,{
            message : "phone number must valid for bangladesh.format: +8801XXXXXXXXX or 01XXXXXXXXX"
        }).optional()
        ,
        role : z.enum(Object.values(Role) as [string]).optional(),
        isActive : z.enum(Object.values(IsActive) as [string]).optional(),
        isDeleted : z.boolean({invalid_type_error:"isDeleted must be true or false"}).optional(),
        isVerified : z.boolean({invalid_type_error : "isVerified must be true or false"}).optional(),

        address: z.string({invalid_type_error : "address must be string"})
        .max(200,{message: "address can not exceed 200 characters"})
        .optional()
    })