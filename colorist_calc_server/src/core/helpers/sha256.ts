import { createHash } from "crypto";

export const generateSHA256 = (input: string): string =>
  createHash("sha256").update(input).digest("hex");