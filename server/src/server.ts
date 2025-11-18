import express from "express";
import cors from "cors";
import helmet from "helmet";
import { authRouter } from "./auth/auth.routes";
import { historyRouter } from "./history/history.routes";
import { errorHandler } from "./middleware/error";

const app = express();

// Security middleware
app.use(helmet());

// Parse JSON requests
app.use(express.json());

// CORS – allow your React frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Auth API routes
app.use("/auth", authRouter);

// History API routes (THIS IS THE ADDITION)
app.use("/api/history", historyRouter);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("———————————————");
  console.log("🔥 AES Explorer API Running");
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`🔗 Accepting requests from: ${process.env.FRONTEND_URL}`);
  console.log("———————————————");
});