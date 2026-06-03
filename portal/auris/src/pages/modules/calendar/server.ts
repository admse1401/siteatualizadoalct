import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { initDB } from "./server/db";
import { initCron } from "./server/cron";
import apiRoutes from "./server/api";

const PORT = 3000;

async function startServer() {
  const app = express();
  
  app.use(cors());
  app.use(express.json());

  // Initialize SQLite Database
  await initDB();

  // Initialize Cron Jobs
  await initCron();

  // Load API Routes
  app.use("/api", apiRoutes);

  // Vite middleware for development or Static File serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
