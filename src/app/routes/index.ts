import { Router } from "express";
import { userRouter } from "../modules/user/user.route";

export const router = Router();

const modulesRoutes = [
    {
        path : "/user",
        route : userRouter
    },
    
];

modulesRoutes.forEach((route) =>{
    router.use(route.path, route.route)
})