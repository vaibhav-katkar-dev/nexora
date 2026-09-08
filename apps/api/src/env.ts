import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load .env from apps/api or project root
const envCandidates = [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "apps/api/.env"),
];
const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));
dotenv.config(envPath ? { path: envPath } : undefined);
