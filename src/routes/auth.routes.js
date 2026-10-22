import { Router } from "express"
import * as authController from "../controllers/auth.controller.js"

const authRouter = Router();

authRouter.post('/register',authController.Register)

authRouter.get("/get-me",authController.getMe)
authRouter.get("/refresh-token",authController.refreshToken)

export default authRouter