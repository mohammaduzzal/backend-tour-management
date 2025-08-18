/* eslint-disable @typescript-eslint/no-unused-vars */
import  httpStatus  from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { GuideServices } from './guide.service';
import { IGuide } from './guide.interface';

const createGuide = catchAsync(async(req : Request, res : Response, next : NextFunction)=>{
    
    const payload : IGuide = {
        ...req.body,
        nidPhoto : req.file?.path
    }
    const result = await GuideServices.createGuide(payload)
    
    sendResponse(res,{
        success : true,
        statusCode : httpStatus.CREATED,
        message : "guide created successfully",
        data : result
    })
})


const updateGuide = catchAsync(async(req : Request, res : Response, next : NextFunction)=>{
    const guideId = req.params.guideId;
    const result = await GuideServices.updateGuide(guideId,req.body)
    
    sendResponse(res,{
        success : true,
        statusCode : httpStatus.OK,
        message : "guide updated successfully",
        data : result
    })
})
const getAllGuides = catchAsync(async(req : Request, res : Response, next : NextFunction)=>{

    const query = req.query
    const result = await GuideServices.getAllGuides(query as Record<string,string>)
    
    sendResponse(res,{
        success : true,
        statusCode : httpStatus.OK,
        message : "all guides retrieved successfully",
        data : result.data,
        meta : result.meta
    })
})


const getSingleGuide = catchAsync(async(req : Request, res : Response, next : NextFunction)=>{

    const guideId = req.params.guideId
    const result = await GuideServices.getSingleGuide(guideId)
    
    sendResponse(res,{
        success : true,
        statusCode : httpStatus.OK,
        message : "guide retrieved successfully",
        data : result
        
    })
})


export const GuideController = {
    createGuide,
    updateGuide,
    getAllGuides,
    getSingleGuide
}