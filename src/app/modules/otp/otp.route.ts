import { Router } from "express";
import { OtpController } from "./otp.controller";

const router = Router()

router.post("/send", OtpController.sendOpt)
router.post("/verify", OtpController.verifyOpt)



export const OtpRoutes = router