/* eslint-disable @typescript-eslint/no-unused-vars */
import  httpStatus  from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { BookingServices } from "./booking.service";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from 'jsonwebtoken';

const createBooking = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const decodeToken = req.user as JwtPayload

    const booking = await BookingServices.createBooking(req.body,decodeToken.userId)

    sendResponse(res,{
        statusCode : httpStatus.CREATED,
        success:true,
        message:"booking created successfully",
        data:booking
    })
})





const getAllBooking = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const query = req.query
    const result = await BookingServices.getAllBooking(query as Record<string,string>)

    sendResponse(res,{
        statusCode : httpStatus.OK,
        success:true,
        message:"booking retrieved successfully",
        data:result.data,
        meta:result.meta
    })
})




const getMyBooking = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const decodedToken = req.user as JwtPayload;

    const result = await BookingServices.getMyBooking(decodedToken.userId)
    

    sendResponse(res,{
        statusCode : httpStatus.OK,
        success:true,
        message:"booking retrieved successfully",
        data:result.data
    })
})


const getSingleBooking = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const bookingId = req.params.bookingId
    const result = await BookingServices.getSingleBooking(bookingId)
    

    sendResponse(res,{
        statusCode : httpStatus.OK,
        success:true,
        message:"booking retrieved successfully",
        data: result.data
    })
})
const updateBookingStatus = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const bookingId = req.params.bookingId
    const payload = req.body;

    const result =await BookingServices.updateBookingStatus(bookingId, payload)
   

    

    sendResponse(res,{
        statusCode : httpStatus.OK,
        success:true,
        message:"booking updated successfully",
        data: result
    })
})









export const BookingController = {
    createBooking,
    getAllBooking,
    getSingleBooking,
    updateBookingStatus,getMyBooking
}