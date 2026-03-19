import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any; 
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        return res.status(401).json({error:"akses ditolak, token tidak ditemukan"});
    }
    try {
        const secret=process.env.JWT as string;
        const decoded=jwt.verify(token,secret);
        req.user=decoded;
        next();
    } catch (error) {
        return res.status(403).json({error:"token tidak valid atau kadarluarsa"})
    }
}