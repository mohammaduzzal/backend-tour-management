/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError"
import { handleDuplicateError } from "../helpers/handleDuplicateError"
import { handleCastError } from "../helpers/handleCastError"
import { handleZodError } from "../helpers/handleZodError"
import { handleValidationError } from "../helpers/handleValidationError"
import { TErrorSources } from "../interfaces/error.types"



// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
export const globalErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
    if(envVars.NODE_ENV === "development"){
        console.log(error);
    }



   
    let errorSources: TErrorSources[] = [] 
    let statusCode = 500
    let message = "something went wrong"

    if (error.code === 11000) {
        const simplifiedError = handleDuplicateError(error) 
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;

    }
    else if (error.name === "CastError") {
        const simplifiedError = handleCastError(error);
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;


    }
    else if (error.name === "ZodError") {
        const simplifiedError = handleZodError(error)
        statusCode = simplifiedError.statusCode;
        message = simplifiedError.message;
        errorSources=simplifiedError.errorSources as TErrorSources[]
          

    }
    else if (error.name === "ValidationError") {

        const simplifiedError = handleValidationError(error)
        statusCode = simplifiedError.statusCode; 
        errorSources = simplifiedError.errorSources as TErrorSources[]
        message = simplifiedError.message
    }
    else if (error instanceof AppError) {
        statusCode = error.statusCode
        message = error.message
    }
    else if (error instanceof Error) {
        statusCode = 500;
        message = error.message
    }

    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        error : envVars.NODE_ENV === "development" ? error :null,
        stack: envVars.NODE_ENV === "development" ? error.stack : null
    })
}