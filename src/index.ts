import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import { prisma } from "./config/database.js";
import route from "./routes/user.routes.js"; 

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({limit: "1mb"}));
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is running smoothly." });
});

app.use("/api/v1/users", route);
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "Endpoint not found." });
});
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 Server Error:", err.message);  
  res.status(500).json({
    error: "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && { detail: err.message }),
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});

process.on("SIGINT", async () => {
  console.log("\n⚠️ Menutup koneksi database...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("🛑 Server dimatikan dengan aman.");
    process.exit(0);
  });
});