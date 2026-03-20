import type { Request, Response, NextFunction } from "express";
import argon2 from "argon2";
import { prisma } from "../config/database.js";
import jwt  from "jsonwebtoken";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Tangkap req.body langsung. 
    // Isinya sudah DIJAMIN sesuai dengan registerSchema oleh Middleware Zod!
    const { name, email, password } = req.body;

    const existUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existUser) {
      return res.status(409).json({ error: "email sudah terdaftar" }); 
    }
    
    const hashPassword = await argon2.hash(password);
    
    const userNew = await prisma.user.create({
      data: {
        email,
        name,
        password: hashPassword
      }
    });
    
    return res.status(201).json({
      message: "pendaftaran berhasil",
      user: {
        id: userNew.id,
        email: userNew.email,
        name: userNew.name
      }
    });
  } catch (error) {
    next(error);
  }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Data ini dijamin aman oleh validate(loginSchema)
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({ message: "email atau password salah" });
    }
    
    const correctPass = await argon2.verify(user.password, password);
    if (!correctPass) {
      return res.status(401).json({ message: "email atau password salah" });
    }
    
    // Keamanan ekstra: Pastikan secret JWT ada di .env
    const secret = process.env.JWT; // Biasakan pakai nama yang jelas misal JWT_SECRET
    if (!secret) {
        throw new Error("JWT_SECRET belum diatur di environment variables");
    }

    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "1d" });
    
    return res.status(200).json({
      message: "Login Berhasil",
      token,
      user: {
        id: user.id,
        name: user.name, // Tambahan opsional: kembalikan nama agar frontend bisa menyapa "Halo, Rafa"
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
}

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }
    
    return res.status(200).json({
      message: "Profil berhasil diambil",
      user
    });
  } catch (error) {
    next(error);
  }
}