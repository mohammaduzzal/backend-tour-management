/* eslint-disable @typescript-eslint/no-unused-vars */
import  httpStatus  from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { OtpService } from './otp.service';

const sendOpt =catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

    const {email,name} = req.body
    await OtpService.sendOtp(email,name)

    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"otp sent successfully",
        data:null
    })
})
const verifyOpt =catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

    const {email,otp} = req.body
    await OtpService.verifyOtp(email,otp)

    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"otp sent successfully",
        data:null
    })
})

export const OtpController={
    sendOpt,
    verifyOpt
}