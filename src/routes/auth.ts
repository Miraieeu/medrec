/*import { Router } from "express";
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
/*
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
*/
import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";

const router = Router();

/**
 * EXCHANGE FRONTEND SESSION → API TOKEN
 */
router.post("/exchange", async (req, res) => {
  const { email } = req.body;
  console.log("🔥 EXCHANGE BODY =", req.body);
if (!email) {
  return res.status(400).json({ error: "email required" });
}

const user = await prisma.user.findUnique({
  where: { email },
});

if (!user) {
  return res.status(401).json({ error: "User not found" });
}


const apiToken = jwt.sign(
  {
    id: user.id,        // ⬅️ GANTI userId → id
    role: user.role,
    email: user.email, // opsional tapi bagus
  },
  process.env.JWT_SECRET!,
  { expiresIn: "1h" }
);


  res.json({
    token: apiToken,
    role: user.role,
  });
});

export default router;
