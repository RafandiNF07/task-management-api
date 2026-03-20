import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface TokenPayload extends jwt.JwtPayload {
    userId: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: number;
            };
        }
    }
}

export type AuthRequest = Request & {
    user: {
        userId: number;
    };
};

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "akses ditolak, token tidak ditemukan" });
    }

    try {
        const secret = process.env.JWT;
        if (!secret) {
            throw new Error("JWT belum diatur");
        }

        const decoded = jwt.verify(token, secret);

        if (
            typeof decoded !== "object" ||
            decoded === null ||
            typeof decoded.userId !== "number"
        ) {
            return res.status(403).json({ error: "payload token tidak valid" });
        }

        const payload = decoded as TokenPayload;
        req.user = { userId: payload.userId };
        next();
    } catch (error) {
        return res.status(403).json({ error: "token tidak valid atau kadarluarsa" });
    }
};