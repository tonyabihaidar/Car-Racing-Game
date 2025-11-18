import "dotenv/config";

// Helper for REQUIRED env variables
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.warn(`⚠️ Missing environment variable: ${name}`);
    return ""; // Prevents crashing
  }
  return value;
}

export const env = {
  // Server port
  port: Number(process.env.PORT || 8080),

  // Frontend URL
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // Base API URL
  appUrl: process.env.APP_URL || "http://localhost:8080",

  // Database
  dbUrl: required("DATABASE_URL"),

  // JWT secrets (fallback prevents TS errors)
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "default_access_secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "default_refresh_secret",

  // Token expiration
  jwtAccessTtl: process.env.JWT_ACCESS_TTL || "15m",
  jwtRefreshTtl: process.env.JWT_REFRESH_TTL || "7d",
};
