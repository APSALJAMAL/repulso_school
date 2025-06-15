import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "../lib/db";

interface JWTPayload {
  id: number;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1️⃣ Try to get token from Authorization header
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2️⃣ Or fallback to cookie
  if (!token && req.cookies?.token) {
    const cookieToken = req.cookies.token;

    if (typeof cookieToken === "string" && cookieToken.startsWith("Bearer ")) {
      token = cookieToken.replace("Bearer ", "");
    } else if (typeof cookieToken === "string") {
      token = cookieToken;
    }
  }


  if (!token) {
    return res.status(401).send("Unauthorized, no token provided");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

    const user = await db.user.findUnique({
      where: {
        id: decoded.id,
      },
      select: {
        id: true,
        fullName: true,
        avatarUrl: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(401).send("Unauthorized, user not found");
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send("Unauthorized, invalid token");
  }
};
