import { z } from 'zod';
export const createTaskSchema=z.object({
    title: z.string().min(3, "masukan minimal 3 huruf"),
    description: z.string().optional(),

    status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "REVISION", "DONE"]).optional(),
    priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),

    deadline: z.iso.datetime({message:"format tanggal tidak valid"}).optional(),
    assigneeId: z.number().int().positive().optional()
})