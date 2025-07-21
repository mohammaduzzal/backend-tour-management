import { Router } from "express";
import { userRoutes } from "../modules/user/user.route";
import { authRoutes} from "../modules/auth/auth.route";
import { divisionRoutes } from "../modules/division/division.route";
import { tourRouter } from "../modules/tour/tour.route";

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
        route : tourRouter
    }
    
];

modulesRoutes.forEach((route) =>{
    router.use(route.path, route.route)
})