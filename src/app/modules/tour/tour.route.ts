import { Router } from "express";
import { TourController } from "./tour.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createTourTypeZodSchema, createTourZodSchema, updateTourZodSchema } from "./tour.validation";

const router = Router();

router.get("/tour-types", TourController.getAllTourTypes)

router.post(
    "/create-tour-type",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createTourTypeZodSchema),
    TourController.createTourType
);





router.patch(
    "/tour-type/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(createTourTypeZodSchema),
    TourController.updateTourType
);

router.delete("/tour-type/:id",checkAuth(Role.ADMIN, Role.SUPER_ADMIN),TourController.deleteTourType)







// -----------------------------------------
router.post("/create",
    checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
    validateRequest(createTourZodSchema),
     TourController.createTour)

 router.get("/", TourController.getAllTours)

 router.get("/:slug", TourController.getSingleTour)


 router.patch("/:id",
    checkAuth(Role.ADMIN,Role.SUPER_ADMIN),
    validateRequest(updateTourZodSchema),
    TourController.updateTour
 )
 router.delete("/:id",checkAuth(Role.ADMIN,Role.SUPER_ADMIN),TourController.deleteTour)






export const tourRoutes = router