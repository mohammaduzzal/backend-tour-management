/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import  httpStatus  from 'http-status-codes';
import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import { authServices } from './auth.service';
import AppError from '../../errorHelpers/AppError';
import { setAuthCookie } from '../../utils/setCookie';
import { createUserToken } from '../../utils/userToken';
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import passport, { use } from 'passport';

const credentialsLog =catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    // const loginInfo = await authServices.credentialsLog(req.body);

    // using passport for credential login
    passport.authenticate("local", async(err:any,user:any,info:any)=>{

        if(err){
            // return next(err)
            return next(new AppError(401,err))
        }

        if(!user){
            return next(new AppError(401,info.message))
        }

        const userTokens = await createUserToken(user)

        // delete user.toObject().password
        const {password, ...rest} = user.toObject()

         setAuthCookie(res,userTokens)


    sendResponse(res, {
        success:true,
        statusCode : httpStatus.OK,
        message: "Logged in successful",
        data: {
            accessToken : userTokens.accessToken,
            refreshToken : userTokens.refreshToken,
            data: rest
        }
    })
    })(req,res,next)

   
   
})

const getNewAccessToken =catchAsync(async(req:Request, res:Response, next:NextFunction)=>{
    
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken){
        throw new AppError(httpStatus.BAD_REQUEST, "no refresh token received from cookies")
    }
    const tokenInfo = await authServices.getNewAccessToken(refreshToken as string);

    // res.cookie("accessToken", tokenInfo.accessToken,{
    //     httpOnly : true,
    //     secure:false
    // })
    setAuthCookie(res,tokenInfo)


    sendResponse(res, {
        success:true,
        statusCode : httpStatus.OK,
        message: "new access token retrieved successful",
        data: tokenInfo
    })
})

const logout =catchAsync(async(req :Request,res:Response,next:NextFunction)=>{

    res.clearCookie("accessToken",{
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    })
    res.clearCookie("refreshToken",{
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    })

    sendResponse(res, {
        success:true,
        statusCode:httpStatus.OK,
        message:"logout successful",
        data:null
    })
})


const resetPassword =catchAsync(async(req : Request,res:Response,next:NextFunction)=>{
    
    const decodedToken = req.user;
    

     await authServices.resetPassword(req.body,decodedToken as JwtPayload)
    
    
    
    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"password changed successfully",
        data :null
    })
})


const setPassword =catchAsync(async(req : Request,res:Response,next:NextFunction)=>{
    
    const decodedToken = req.user as JwtPayload;
    const {password} = req.body;

     await authServices.setPassword(decodedToken.userId, password)
    
    
    
    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"password changed successfully",
        data :null
    })
})


const forgetPassword =catchAsync(async(req : Request,res:Response,next:NextFunction)=>{
    
   

    const {email} = req.body;

     await authServices.forgetPassword(email)
    
    
    
    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"email sent successfully",
        data :null
    })
})


const changePassword =catchAsync(async(req : Request,res:Response,next:NextFunction)=>{
    
    const decodedToken = req.user;
    const newPassword = req.body.newPassword;
    const oldPassword = req.body.oldPassword;

     await authServices.changePassword(oldPassword,newPassword,decodedToken as JwtPayload)
    
    
    
    sendResponse(res,{
        success:true,
        statusCode:httpStatus.OK,
        message:"password changed successfully",
        data :null
    })
})

const googleCallback=catchAsync(async(req:Request,res:Response,next:NextFunction)=>{
    let redirectTo = req.query.state ? req.query.state as string : "";

    if(redirectTo.startsWith("/")){
        redirectTo = redirectTo.slice(1)
    }


    const user = req.user;
    if(!user){
        throw new AppError(httpStatus.NOT_FOUND,"user not found")
    }

    const tokenInfo =  createUserToken(user)

    setAuthCookie(res,tokenInfo)

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
})






export const authController={
    credentialsLog,
    getNewAccessToken,
    logout,
    resetPassword,
    googleCallback,
    changePassword,
    setPassword,
    forgetPassword
}