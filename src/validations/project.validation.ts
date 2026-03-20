import { z } from 'zod';

export const projectSchema = z.object({
    name: z.string().min(3,"masukan minimal 3 karakter"),
    description: z.string().optional(),
})