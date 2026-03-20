import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.js";
import { tr } from "zod/locales";
import { error } from "node:console";

export const createProject = async (
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    try {
        // 1. Data sudah dipastikan valid dan berwujud objek oleh middleware validate(projectSchema)
        const { name, description } = req.body;
        const userId = req.user!.userId;
        
        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                members: {
                    create: {
                        userId: userId,
                        role: "LEADER"
                    }
                }
            },
            include: {
                members: {
                    select: { userId: true, role: true }
                }
            }
        });
        
        return res.status(201).json({
            message: "berhasil membuat project",
            project: newProject
        });
    } catch (error) {
        next(error);
    }
}

export const getProject = async (
    req: Request,
    res: Response,
    next: NextFunction
)=> {
    try {
        const userId = req.user!.userId;
        
        const projects = await prisma.project.findMany({
            where: {
              members: { some: { userId: userId } },
              isArchived: false
            },
            orderBy: { createdAt: 'desc' },
            include: {
                members: {
                    where: { userId: userId },
                    select: { role: true }
                }
            }
        });
        
        return res.status(200).json({
            message: "berhasil ambil daftar proyek",
            projects
        });
    } catch (error) {
        next(error);
    }
}      

export const getProjectById = async (
    req: Request,
    res: Response,
    next: NextFunction
)=>  {
    try {
        // 2. ID otomatis diubah jadi Number oleh z.coerce di middleware validateData(projectIdSchema, "params")
        const projectId = req.params.id as unknown as number;
        const userId = req.user!.userId;
        
        const getProject = await prisma.project.findFirst({
            where: {
                id: projectId,
                members: { some: { userId: userId } },
                isArchived: false
            },
            include: {
                members: {
                    select: { userId: true, role: true }
                }
            }
        });
        
        if(!getProject){
            return res.status(404).json({ error: "project not found" });
        }
        
        return res.status(200).json({
            message: "berhasil ambil project",
            project: getProject
        });
    } catch (error) {
        next(error);
    }
}

export const updateProject = async (
    req: Request, 
    res: Response, 
    next: NextFunction
)=>{
    try {
        // 3. Menangkap ID (dari params) dan Data Update (dari body) dengan santai
        const projectId = req.params.id as unknown as number;
        const updateData = req.body;
        
        // Pengecekan fail-fast jika body kosong
        if(Object.keys(updateData).length === 0){
            return res.status(400).json({ error: "tidak ada data yang diberikan untuk diubah" });
        }
        const userId = req.user!.userId;
        
        const exitProject = await prisma.project.findFirst({
            where: {
                id: projectId,
                members: {
                    some: { userId: userId, role: "LEADER" }
                },
                isArchived: false
            }
        });
        
        if(!exitProject){
            return res.status(404).json({
                error: "Proyek tidak ditemukan atau Anda tidak memiliki akses sebagai Leader"
            });
        }
        
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: updateData
        });
        
        return res.status(200).json({
            message: "berhasil melakukan update project",
            // Info arsitektur: Frontend sangat terbantu kalau kita kembalikan data terbarunya
            project: updatedProject 
        });
    } catch (error) {
        next(error);
    }
}

export const deleteProject = async ( req: Request, res: Response, next: NextFunction)=>{
    try {
        const projectId=req.params.id as unknown as number;
        const userId=req.user!.userId;
        const exitsProject=await prisma.project.findFirst({
            where:{
                id: projectId,
                members:{
                    some:{
                        userId:userId, role:"LEADER"
                    }
                },
                isArchived:false
            }
        });
        if(!exitsProject) return res.status(404).json({error:"proyek tidak ditemukan atau anda bukan leader"});
        await prisma.project.update({
            where:{
                id: projectId
            },
            data:{
                isArchived:true,
                deletedAt: new Date()
            }
        });
        return res.status(200).json({message:"berhasil menghapus proyek"});
    } catch (error) {
        next(error);
    }
}