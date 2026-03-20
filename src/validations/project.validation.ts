import { z } from 'zod';

export const projectSchema = z.object({
    name: z.string().min(3,"masukan minimal 3 karakter"),
    description: z.string().optional(),
});
export const projectIdSchema = z.object({
    id: z.coerce.number().int().positive("ID harus berupa angka positif")
});
export const updateProjectSchema=z.object({
    name: z.string().min(3,"masukan minimal 3 karakter").optional(),
    description: z.string().optional()
})