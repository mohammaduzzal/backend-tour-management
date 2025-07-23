import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createBookingZodSchema, updateBookingZodSchema } from "./booking.validation";
import { BookingController } from "./booking.controller";

const router = Router();

router.post("/", 
    checkAuth(...Object.values(Role)),
    validateRequest(createBookingZodSchema),
    BookingController.createBooking
)

router.get("/",
    checkAuth(Role.SUPER_ADMIN,Role.ADMIN),
    BookingController.getAllBooking
)

router.get("/my-bookings", 
    checkAuth(...Object.values(Role)),
    BookingController.getMyBooking
)

router.get("/:bookingId", 
    checkAuth(...Object.values(Role)),
    BookingController.getSingleBooking
)


router.patch("/:bookingId/status",
    checkAuth(...Object.values(Role)),
    validateRequest(updateBookingZodSchema),
    BookingController.updateBookingStatus
)




export const bookingRoutes = router