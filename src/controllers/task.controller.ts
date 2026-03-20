import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/database.js";
import { error } from "node:console";

export const createTask = async(req: Request, res: Response, next: NextFunction)=>{
    try {
        const projectId=req.params.id as unknown as number;
        const userId=req.user!.userId;
        const {title, description, status, priority, deadline, assigneeId }=req.body;
    } catch (error) {
        next(error);
    }
};