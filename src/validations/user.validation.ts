import { z } from "zod";
export const registerSchema = z.object({
  email: z.email("Format email tidak valid").toLowerCase(),
  name: z.string().min(3, "Nama minimal 3 karakter").optional(),
  password: z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[A-Z]/, "Harus ada huruf besar")
  .regex(/[0-9]/, "Harus ada angka"),
});
export const loginSchema = z.object({
  email: z.email("Format email tidak valid").toLowerCase(),
  password: z.string().min(1, "password wajib diisi")
});