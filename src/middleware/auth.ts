import { Request, Response, NextFunction } from "express";

export function fakeAuth(req: Request, res: Response, next: NextFunction) {
  // NANTI diganti auth beneran
  req.user = {
    id: 2,
    role: "nurse", // ganti: nurse | doctor | admin
  };

  next();
}
