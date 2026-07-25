import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Password hashing for local email/password auth.
 * Uses Node's built-in scrypt (no extra dependency like bcrypt needed).
 * Stored format: "<salt-hex>:<derivedKey-hex>"
 */

const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;

  const storedKey = Buffer.from(hashHex, "hex");
  const derivedKey = scryptSync(password, salt, KEY_LENGTH);

  if (storedKey.length !== derivedKey.length) return false;
  return timingSafeEqual(storedKey, derivedKey);
}
