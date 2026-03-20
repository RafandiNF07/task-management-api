import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../config/database.js";
import { projectSchema } from "../validations/project.validation.js"

export const createProject = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
)=>{
    try {
        const validasi=projectSchema.safeParse(req.body);
        if(!validasi.success){
            return res.status(400).json({
                error:"validasi gagal",
                details:validasi.error.format()
            })
        }
    
        const {name, description}=validasi.data;
        const userId=req.user?.userId;
        if(!userId){
            return res.status(401).json({
                error:"sesi tidak valid"
            })
        }
        const newProject= await prisma.project.create({
            data:{
                name,
                description,
                members:{
                    create:{
                    userId: userId,
                    role:"LEADER"
                    }
                }
            },
            include:{
                members:{
                    select:{
                        userId:true,
                        role:true
                    }
                }
            }
        });
        return res.status(201).json({
            message:"berhasil membuat project",
            project: newProject
        })
    } catch (error) {
        next(error);
    }
}
