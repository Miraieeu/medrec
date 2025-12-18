import { Request, Response, NextFunction } from "express";

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.group("🎭 ROLE CHECK");
    console.log("required roles =", roles);
    console.log("user =", req.user);

    if (!req.user) {
      console.log("❌ NO USER IN REQUEST");
      console.groupEnd();
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("user role =", req.user.role);

    if (!roles.includes(req.user.role)) {
      console.log("❌ ROLE FORBIDDEN");
      console.groupEnd();
      return res.status(403).json({ error: "Forbidden" });
    }

    console.log("✅ ROLE OK");
    console.groupEnd();
    next();
  };
}

