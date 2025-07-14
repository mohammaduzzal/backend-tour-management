/* eslint-disable @typescript-eslint/no-non-null-assertion */
import  httpStatus, { StatusCodes }  from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import {  IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import { createNewAccessTokenWithNewRefreshToken, createUserToken } from '../../utils/userToken';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';



const credentialsLog =async(payload : Partial<IUser>)=>{
    const {email,password} = payload;
    const isUserExist = await User.findOne({email})

    if(!isUserExist){
        throw new AppError(httpStatus.BAD_REQUEST,"email does not exist")
    }

    const isPasswordMatched =await bcryptjs.compare(password as string, isUserExist.password as string)

    if(!isPasswordMatched){
        throw new AppError(StatusCodes.BAD_REQUEST, "incorrect password")
    }

   const userTokens = createUserToken(isUserExist)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {password : pass , ...rest} = isUserExist.toObject()

    return{
        accessToken : userTokens.accessToken,
        refreshToken : userTokens.refreshToken,
        user : rest
    }
}

const getNewAccessToken =async(refreshToken : string)=>{
    
   const newAccessToken =await createNewAccessTokenWithNewRefreshToken(refreshToken)

    return{
        accessToken :newAccessToken
    }
}

const resetPassword = async(oldPassword : string,newPassword :string, decodedToken : JwtPayload)=>{
    const user = await User.findById(decodedToken.userId)
    
   
    const isOldPasswordMatched = await bcryptjs.compare(oldPassword, user!.password as string)

    if(!isOldPasswordMatched){
        throw new AppError(httpStatus.UNAUTHORIZED, "oldPassword does not match")
    }

    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

    user!.save()

  
}






export const authServices={
    credentialsLog,
    getNewAccessToken,
    resetPassword
}