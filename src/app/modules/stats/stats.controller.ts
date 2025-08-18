/* eslint-disable @typescript-eslint/no-unused-vars */
import  httpStatus  from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import { statsService } from './stats.service';
import { catchAsync } from '../../utils/catchAsync';

const getBookingStats = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const result = await statsService.getBookingStats()
    
    
    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"booking stats retrieved successful",
        data:result
    })
})


const getPaymentStats = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const result = await statsService.getPaymentStats()
    
    
    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"booking stats retrieved successful",
        data:result
    })
})


const getUserStats = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

    const result = await statsService.getUserStats()

   sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"users stats retrieved successful",
        data:result
    })
})


const getTourStats = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const result = await statsService.getTourStats()
    
    
    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"tour stats retrieved successful",
        data:result
    })
})





export const statsController = {
    getBookingStats,
    getPaymentStats,
    getUserStats,
    getTourStats

}