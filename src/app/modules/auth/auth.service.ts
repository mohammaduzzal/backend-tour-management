/* eslint-disable @typescript-eslint/no-explicit-any */
import  jwt  from 'jsonwebtoken';
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import httpStatus from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import bcryptjs from "bcryptjs";
import { createNewAccessTokenWithNewRefreshToken } from '../../utils/userToken';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';
import { IAuthProvider, IsActive } from '../user/user.interface';
import { sendEmail } from '../../utils/sentEmail';




// const credentialsLog =async(payload : Partial<IUser>)=>{
//     const {email,password} = payload;
//     const isUserExist = await User.findOne({email})

//     if(!isUserExist){
//         throw new AppError(httpStatus.BAD_REQUEST,"email does not exist")
//     }

//     const isPasswordMatched =await bcryptjs.compare(password as string, isUserExist.password as string)

//     if(!isPasswordMatched){
//         throw new AppError(StatusCodes.BAD_REQUEST, "incorrect password")
//     }

//    const userTokens = createUserToken(isUserExist)

//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const {password : pass , ...rest} = isUserExist.toObject()

//     return{
//         accessToken : userTokens.accessToken,
//         refreshToken : userTokens.refreshToken,
//         user : rest
//     }
// }

const getNewAccessToken = async (refreshToken: string) => {

    const newAccessToken = await createNewAccessTokenWithNewRefreshToken(refreshToken)

    return {
        accessToken: newAccessToken
    }
}




const resetPassword = async (payload : Record<string,any>, decodedToken: JwtPayload) => {

    if(payload.id != decodedToken.userId){
        throw new AppError(401, "you cannot reset your password")
    }

    const isUserExist = await User.findById(decodedToken.userId)

    if(!isUserExist){
        throw new AppError(401, "user not found")
    }

    const hashPassword = await bcryptjs.hash(payload.newPassword, Number(envVars.BCRYPT_SALT_ROUND))

    isUserExist.password = hashPassword

    await isUserExist.save()



}



const setPassword = async (userId: string, plainPassword: string) => {

    const isUserExist = await User.findById(userId)

    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "user not found")
    }


    if (isUserExist.password && isUserExist.auths.some(providerObject => providerObject.provider === "google")) {
        throw new AppError(httpStatus.BAD_REQUEST, "you have already set password.now you can change the password from your profile password update")
    }



    const hashPassword = await bcryptjs.hash(plainPassword, Number(envVars.BCRYPT_SALT_ROUND))


    const credentialsProvider: IAuthProvider = {
        provider: "credentials",
        providerId: isUserExist.email
    }


    const auths: IAuthProvider[] = [...isUserExist.auths, credentialsProvider]

    isUserExist.password = hashPassword
    isUserExist.auths = auths

    await isUserExist.save()


}


const forgetPassword = async (email: string) => {

    const isUserExist = await User.findOne({ email })

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "user does not exist")
    }


    if (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE) {
        throw new AppError(httpStatus.BAD_REQUEST, `user is ${isUserExist.isActive}`)
    }


    if (isUserExist.isDelete) {
        throw new AppError(httpStatus.BAD_REQUEST, "user is deleted")
    }

    const jwtPayload = {
        userId : isUserExist._id,
        email : isUserExist.email,
        role : isUserExist.role
    }

    const resetToken =  jwt.sign(jwtPayload, envVars.JWT_ACCESS_SECRET,{
        expiresIn : "10min"
    })


    const resetUILink = `${envVars.FRONTEND_URL}/reset-password?id=${isUserExist._id}&token=${resetToken}`


    sendEmail({
        to :isUserExist.email,
        subject : "password rest",
        templateName :  "forgetPassword",
        templateData : {
            name : isUserExist.name,
            resetUILink 
        }
    })




}


const changePassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
    const user = await User.findById(decodedToken.userId)


    const isOldPasswordMatched = await bcryptjs.compare(oldPassword, user!.password as string)

    if (!isOldPasswordMatched) {
        throw new AppError(httpStatus.UNAUTHORIZED, "oldPassword does not match")
    }

    user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

    user!.save()


}






export const authServices = {
    // credentialsLog,
    getNewAccessToken,
    resetPassword,
    changePassword,
    setPassword,
    forgetPassword
}