import { Request, Response, NextFunction } from "express";

export function fakeAuth(req: Request, res: Response, next: NextFunction) {
  // NANTI diganti auth beneran
  req.user = {
    id: 3, // 1, 2, 3, dan 99
    role: "doctor", // ganti: registration | nurse | doctor | admin
  };

  next();
}
