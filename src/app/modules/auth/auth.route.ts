/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response, Router } from "express";
import { authController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import passport from "passport";
import { envVars } from "../../config/env";

const router = Router();

router.post("/login", authController.credentialsLog)
router.post("/refresh-token", authController.getNewAccessToken)
router.post("/logout", authController.logout)




router.post("/change-password",checkAuth(...Object.values(Role)), authController.changePassword)
router.post("/set-password",checkAuth(...Object.values(Role)), authController.setPassword)

router.post("/forget-password", authController.forgetPassword)

router.post("/reset-password",checkAuth(...Object.values(Role)), authController.resetPassword)

router.get("/google", async(req:Request,res:Response,next:NextFunction)=>{
    const redirect = req.query.redirect || "/"
    passport.authenticate("google", {scope: ["profile", "email"], state:redirect as string})(req,res)
})

router.get("/google/callback",passport.authenticate("google", {failureRedirect:`${envVars.FRONTEND_URL}/login   ?error=there is some issues with your account.please contact with our support team`}), authController.googleCallback)

export const authRoutes = router