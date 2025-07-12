import  httpStatus, { StatusCodes }  from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { IUser } from "../user/user.interface";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import { generateToken } from '../../utils/jwt';
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

    const jwtPayload = {
        userId : isUserExist._id,
        email: isUserExist.email,
        role : isUserExist.role
    }

    // const accessToken = jwt.sign(jwtPayload,"secret",{
    //     expiresIn: "1d"
    // })
    const accessToken = generateToken(jwtPayload,envVars.JWT_ACCESS_SECRET,envVars.JWT_ACCESS_EXPIRES)

    return{
        accessToken
    }
}






export const authServices={
    credentialsLog
}