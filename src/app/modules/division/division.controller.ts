/* eslint-disable @typescript-eslint/no-unused-vars */
import  httpStatus  from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { DivisionServices } from "./division.service";
import { sendResponse } from "../../utils/sendResponse";


const createDivision = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const result = await DivisionServices.createDivision(req.body)

    sendResponse(res,{
    success : true,
    statusCode: httpStatus.CREATED,
    message:"division created successfully",
    data:result,
   })
})

const getAllDivisions =catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const query = req.query
    
    const result = await DivisionServices.getAllDivisions(query as Record<string,string>);


    sendResponse(res,{
    success : true,
    statusCode: httpStatus.OK,
    message:"All division retrieved successfully",
    data:result.data,
    meta : result.meta
   })
})

const getSingleDivision = catchAsync(async(req : Request,res:Response,next:NextFunction)=>{
    const slug = req.params.slug
    const result = await DivisionServices.getSingleDivision(slug)

    sendResponse(res,{
    success : true,
    statusCode: httpStatus.OK,
    message:"division retrieved",
    data:result.data,
   })
})

const updateDivision = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const id = req.params.id;
    const payload = req.body;

    const result = await DivisionServices.updateDivision(id,payload);

    sendResponse(res,{
        statusCode : httpStatus.OK,
        success:true,
        message:"Division updated",
        data:result
    })
})

const deleteDivision = catchAsync(async(req : Request,res:Response,next:NextFunction)=>{
    const id = req.params.id;

    const result = await DivisionServices.deleteDivision(id);

    sendResponse(res,{
    success : true,
    statusCode: httpStatus.OK,
    message:"division deleted",
    data:result,
   })
})




export const DivisionController = {
    createDivision,
    getAllDivisions,
    getSingleDivision,
    updateDivision,
    deleteDivision
}