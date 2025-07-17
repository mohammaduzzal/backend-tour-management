/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose"
import { TGenericErrorResponse } from "../interfaces/error.types"

export const handleCastError = (error: mongoose.Error.CastError):TGenericErrorResponse => {
    return {
        statusCode: 400, //cast error/objectId error
        message: "invalid mongodb ObjectId. please provide a valid id"
    }
}