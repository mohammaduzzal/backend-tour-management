/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { userServices } from "./user.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { verifyToken } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";




// const createUser = async(req :Request, res :Response, next :NextFunction) =>{
//     try {
//         // throw new AppError(httpStatus.BAD_GATEWAY, "fake error")
//         const user = await userServices.createUser(req.body)

//         res.status(httpStatus.CREATED).json({
//             message : "user created successfully",
//             user
//         })
        
   
//     } catch (error :any) {
//         console.log(error);
//        next(error)
//     }
// };


const createUser = catchAsync(async(req : Request, res : Response,next :NextFunction)=>{
    const   user = await userServices.createUser(req.body);
   sendResponse(res,{
    success : true,
    statusCode: httpStatus.CREATED,
    message:"user created successfully",
    data:user,
   })
})
const updateUser = catchAsync(async(req : Request, res : Response,next :NextFunction)=>{
    const userId = req.params.id;
    // const token = req.headers.authorization;
    // const verifiedToken = verifyToken(token as string,envVars.JWT_ACCESS_SECRET) as JwtPayload;
    const verifiedToken = req.user
    
    const payload = req.body;
  
  const   user = await userServices.updateUser(userId,payload,verifiedToken);
   sendResponse(res,{
    success : true,
    statusCode: httpStatus.CREATED,
    message:"user updated successfully",
    data:user,
   })
})




const getAllUser = catchAsync(async(req:Request, res:Response,next:NextFunction)=>{
    const result = await userServices.getAllUser()
  sendResponse(res,{
    success : true,
    statusCode: httpStatus.OK,
    message:"all user retrieve successfully",
    data:result.data,
    meta : result.meta
   })
})


export const userController = {
    createUser,
    getAllUser,
    updateUser
}