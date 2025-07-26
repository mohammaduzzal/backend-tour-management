/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status-codes';
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TourServices } from "./tour.service";
import { sendResponse } from "../../utils/sendResponse";
import { ITour } from './tour.interface';

const createTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload :ITour ={
        ...req.body,
        images : (req.files as Express.Multer.File[]).map(file => file.path)
    };

    const result = await TourServices.createTour(payload)

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Tour created successfully",
        data: result
    })
})

const getAllTours = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    const query = req.query
    const result = await TourServices.getAllTours(query as Record<string, string>)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tours retrieved successfully",
        data: result.data,
        meta : result.meta
    })
})

const getSingleTour = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    
    const slug = req.params.slug
    const result = await TourServices.getSingleTour(slug)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour retrieved successfully",
        data: result.data
        
    })
})


const updateTour = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const payload :ITour = {
        ...req.body,
        images : (req.files as Express.Multer.File[]).map(file => file.path)
    }

    const result = await TourServices.updateTour(req.params.id,payload)

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour updated successfully",
        data: result
    })
    
})

const deleteTour  =catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const result = await TourServices.deleteTour(req.params.id)

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour deleted successfully",
        data: result
    })
})


// -------------------tour type------------------------------

const createTourType = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    
    const result = await TourServices.createTourType(req.body)

      sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Tour Type created successfully",
        data: result
    })
})

const getAllTourTypes = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    
    const query = req.query
    const result = await TourServices.getAllTourTypes(query as Record<string,string>)

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour type retrieved successfully",
        data: result.data,
        meta : result.meta
    })
})


const updateTourType = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const {id} = req.params;
    const payload = req.body;

    const result = await TourServices.updateTourType(id,payload)

     sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour type updated successfully",
        data: result
    })
})

const deleteTourType = catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    const {id} = req.params;
    const result = await TourServices.deleteTourType(id)

     sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Tour type deleted successfully",
        data: result
    })
})

export const TourController = {
    createTour,
    getAllTours,
    getSingleTour,
    updateTour,
    deleteTour,
    createTourType,
    getAllTourTypes,
    updateTourType,
    deleteTourType
}