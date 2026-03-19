import type { Request, Response, NextFunction } from "express";
import argon2 from "argon2";
import { prisma } from "../config/database.js";
import { registerSchema,loginSchema } from "../validations/user.validation.js";
import jwt  from "jsonwebtoken";
import type { AuthRequest} from "../middleware/auth.middleware.js";

export const registerUser = async(req:Request, res:Response, next:NextFunction)=>{
  try {
    const validation = registerSchema.safeParse(req.body);
    if(!validation.success){
      return res.status(400).json({error: "Validasi gagal", details: validation.error.format() });
    }
    const { name, email, password } =  validation.data;

    const existUser = await prisma.user.findUnique({
      where: {email}
    });
    if(existUser){
      return res.status(409).json({error:"email sudah terdaftar"}); 
    }
    const hashPassword = await argon2.hash(password);
    const userNew = await prisma.user.create({
      data:{
        email,
        name,
        password: hashPassword
      }
    })
    return res.status(201).json({
      message:"pendaftaran berhasil",
      user:{
        id: userNew.id,
        email: userNew.email,
        name: userNew.name
      }
    })
  } catch (error) {
    next(error)
  }
}
export const loginUser= async(req: Request, res: Response, next: NextFunction)=>{
  try {
    const validation =  loginSchema.safeParse(req.body);
    if(!validation.success){
      return res.status(400).json({
        error:"validasi gagal",
        details:validation.error.format()
      })
    }
    const {email, password }=validation.data;
    const user=await prisma.user.findUnique({
    where: {email}
    })
    if(!user){
      return res.status(401).json({
        message:"email atau password salah"
      })
    }
    const correctPass= await argon2.verify(user.password, password);
    if(!correctPass){
      return res.status(401).json({
        message:"email atau password salah"
    })
  }
    const secret= process.env.JWT as string;
    const token = jwt.sign({userId: user.id}, secret, {expiresIn:"1d"});
    return res.status(200).json({
      message:"Login Berhasil",
      token,
      user: {
        id: user.id,
      }
    })
  } catch (error) {
    next(error);
  }
}
export const getMe=async(req: AuthRequest, res: Response, next: NextFunction)=>{
try {
  const userId= req.user?.userId
  if(!userId){
    return res.status(400).json({ error: "Data token tidak valid" });
  }
  const user = await prisma.user.findUnique({
    where: {id: userId},
    select: {
      id: true,
        email: true,
        name: true,
        createdAt: true,
    }
  });
  if(!user){
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