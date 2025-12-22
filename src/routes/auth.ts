import { Router } from "express";
import { login,logout } from "../services/auth.service";
import { authJWT } from "../middleware/authJWT";
const router = Router();
// Router Login

router.post("/login",login);
router.post("/logout",authJWT,logout);
export default router;
