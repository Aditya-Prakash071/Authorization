import { Router } from "express"
import * as authController from "../controllers/auth.controller.js"

const authRouter = Router();

authRouter.post('/register',authController.Register)

authRouter.get("/get-me",authController.getMe)
authRouter.get("/refresh-token",authController.refreshToken)
authRouter.get("/logout",authController.logOut)
authRouter.get("/logout-all",authController.logOutAll)
authRouter.post("/login",authController.login)
authRouter.post("/verify-otp",authController.verifyOtp)


export default authRouter