import { Router } from "express";
import { login } from "../services/auth.service";

const router = Router();
// Router Login

router.post("/login",login);

export default router;
