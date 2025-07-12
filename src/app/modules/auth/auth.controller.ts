/* eslint-disable @typescript-eslint/no-unused-vars */
import  httpStatus  from 'http-status-codes';
import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { authServices } from './auth.service';

const credentialsLog =catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    const loginInfo = await authServices.credentialsLog(req.body);


    sendResponse(res, {
        success:true,
        statusCode : httpStatus.OK,
        message: "Logged in successful",
        data: loginInfo
    })
})






export const authController={
    credentialsLog
}