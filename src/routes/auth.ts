import { Router } from "express";
import { login } from "../services/auth.service";
import { authJWT } from "../middleware/authJWT";
import { AppError } from "../errors/AppError";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT token
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */

// =======================
// LOGIN
// =======================
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 🧠 Error level: request validation
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    // 🧠 Error level: business logic (handled di service)
    const result = await login(email, password);

    res.json(result);
  } catch (err) {
    next(err); // ⬅️ lempar SEMUA error ke global handler
  }
});

// =======================
// GET CURRENT USER
// =======================
router.get("/me", authJWT, (req, res) => {
  if (!req.user) {
    throw new AppError("Unauthorized", 401);
  }

  res.json({
    success: true,
    data: req.user,
  });
});

export default router;
