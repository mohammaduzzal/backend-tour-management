import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes} from "../modules/auth/auth.route";
import { divisionRoutes } from "../modules/division/division.route";
import { tourRoutes } from "../modules/tour/tour.route";
import { bookingRoutes } from "../modules/booking/booking.route";
import {  PaymentRoutes } from "../modules/payment/payment.route";
import { OtpRoutes } from "../modules/otp/otp.route";
import { StatsRoutes } from "../modules/stats/stats.routes";
import { guideRoutes } from "../modules/guide/guide.route";

export const router = Router();

const modulesRoutes = [
    {
        path : "/user",
        route : userRoutes
    },
    {
        path : "/auth",
        route : authRoutes
    },
    {
        path : "/division",
        route: divisionRoutes
    },
    {
        path : "/tour",
        route : tourRoutes
    },
    {
        path : "/booking",
        route : bookingRoutes
    },
    {
        path : "/payment",
        route : PaymentRoutes
    },
    {
        path : "/otp",
        route : OtpRoutes
    },
    {
        path : "/stats",
        route : StatsRoutes
    },
    {
        path : "/guide",
        route : guideRoutes
    }
    
];

modulesRoutes.forEach((route) =>{
    router.use(route.path, route.route)
})