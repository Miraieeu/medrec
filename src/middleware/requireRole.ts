import { AppError } from "../errors/AppError";

export function requireRole(allowedRoles: string[]) {
  return (req, _res, next) => {
    if (!req.user) {
      throw new AppError("Unauthenticated", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError("Forbidden", 403);
    }

    next();
  };
}
