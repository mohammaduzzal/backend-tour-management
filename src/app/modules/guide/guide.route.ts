import { Router } from "express";
import { GuideController } from "./guide.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { validateRequest } from "../../middlewares/validateRequest";
import { createGuideZodSchema, updateGuideZodSchema } from "./guide.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router()

router.post("/apply",checkAuth(Role.USER),multerUpload.single("file"), validateRequest(createGuideZodSchema), GuideController.createGuide)

router.get("/", checkAuth(Role.SUPER_ADMIN,Role.ADMIN), GuideController.getAllGuides)

router.get("/:guideId", checkAuth(Role.SUPER_ADMIN,Role.ADMIN), GuideController.getSingleGuide)

router.patch("/approve/:guideId", checkAuth(Role.SUPER_ADMIN,Role.ADMIN), validateRequest(updateGuideZodSchema), GuideController.updateGuide)

export const guideRoutes = router