import { ApiError } from "../utils/apiError";

export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new ApiError(500, `Variable d'environnement requise manquante : ${name}`);
  }

  return value;
}
