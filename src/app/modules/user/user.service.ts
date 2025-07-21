import httpStatus from 'http-status-codes';
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import AppError from '../../errorHelpers/AppError';
import bcryptjs from "bcryptjs";
import { envVars } from '../../config/env';
import { JwtPayload } from 'jsonwebtoken';
import { QueryBuilder } from '../../utils/QueryBuilders';
import { userSearchableFields } from './user.contant';


const createUser = async (payload: Partial<IUser>) => {
   const { email, password, ...rest } = payload;
   const isUserExist = await User.findOne({ email })

   // if (isUserExist) {
   //    throw new AppError(httpStatus.BAD_REQUEST, "user already exist")
   // }

   const hashPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))



   const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string }


   const user = await User.create({
      email,
      password: hashPassword,
      auths: [authProvider],
      ...rest
   })
   return user
};

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {

   const isUserExist = await User.findById(userId);
   if (!isUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, "user not found")
   }

   if (payload.role) {
      if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
         throw new AppError(httpStatus.FORBIDDEN, "you are not authorized")
      }
      if (payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN) {
         throw new AppError(httpStatus.FORBIDDEN, "you are not authorized")
      }
   }

   if (payload.isActive || payload.isDelete || payload.isVerified) {
      if (decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE) {
         throw new AppError(httpStatus.FORBIDDEN, "you are not authorized")
      }
   }

   if (payload.password) {
      payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
   }

   const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
      new: true,
      runValidators: true
   })

   return newUpdatedUser

}

const getAllUser = async (query: Record<string, string>) => {
   const queryBuilder = new QueryBuilder(User.find(), query)

   const usersData = queryBuilder
      .filter()
      .search(userSearchableFields)
      .sort()
      .fields()
      .pagination()

      const [data,meta] = await Promise.all([
         usersData.build(),
         queryBuilder.getMeta()
      ])


   return {
      data,
      meta
   }
}

const getSingleUser = async (id: string) => {
   const user = await User.findById(id)
   return {
      data: user
   }
}

export const userServices = {
   createUser,
   getAllUser,
   updateUser,
   getSingleUser
}