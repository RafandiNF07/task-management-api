import type { Request, Response, NextFunction } from "express";
import argon2 from "argon2";
import { prisma } from "../config/database.js";
import { registerSchema } from "../validations/user.validation.js";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Validasi Input (Fail-Fast)
    // safeParse tidak melempar error, tapi mengembalikan object status success/error
    const validation = registerSchema.safeParse(req.body);
    
    if (!validation.success) {
      res.status(400).json({ 
        error: "Validasi gagal", 
        details: validation.error.format() 
      });
      return; // Hentikan eksekusi jika tidak valid
    }

    const { email, name, password } = validation.data;

    // 2. Cek apakah email sudah terdaftar (Mencegah error P2002 Prisma)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(409).json({ error: "Email sudah terdaftar" });
      return;
    }

    // 3. Hashing Password menggunakan Argon2
    const hashedPassword = await argon2.hash(password);

    // 4. Simpan ke Database
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword, // <--- TAMBAHKAN BARIS INI
      },
    });

    // 5. Kembalikan respons sukses (JANGAN PERNAH mengembalikan password, meskipun sudah di-hash)
    res.status(201).json({
      message: "Registrasi berhasil",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    // Serahkan error tak terduga ke Centralized Error Handler di index.ts
    next(error);
  }
};