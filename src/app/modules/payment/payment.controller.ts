import  httpStatus  from 'http-status-codes';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentServices } from "./payment.service";
import { envVars } from "../../config/env";
import { sendResponse } from "../../utils/sendResponse";

const initPayment = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const bookingId = req.params.bookingId;

    const result = await paymentServices.initPayment(bookingId)

    sendResponse(res,{
        success:true,
        statusCode:httpStatus.CREATED,
        message:"payment done successfully",
        data:result
    })
})


const successPayment = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const query = req.query
    const result = await paymentServices.successPayment(query as Record<string,string>)

    if(result.success){
        res.redirect(`${envVars.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
    }
})




const failPayment = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

      const query = req.query
    const result = await paymentServices.failPayment(query as Record<string,string>)

    if(!result.success){
        res.redirect(`${envVars.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
    }

})




const cancelPayment = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
      const query = req.query
    const result = await paymentServices.cancelPayment(query as Record<string,string>)

    if(!result.success){
        res.redirect(`${envVars.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&message=${result.message}&amount=${query.amount}&status=${query.status}`)
    }

})

export const paymentController ={
    initPayment,
    successPayment,
    failPayment,
    cancelPayment
}