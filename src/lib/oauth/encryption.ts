import crypto from "crypto";

/**
 * Token encryption utilities
 * Encrypts tokens at rest for security
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16; // For AES, this is always 16

if (!ENCRYPTION_KEY) {
  console.warn(
    "ENCRYPTION_KEY not set. Tokens will not be encrypted. Set a 32-byte hex key in production."
  );
}

/**
 * Encrypt a token
 */
export function encryptToken(token: string): string {
  if (!ENCRYPTION_KEY) {
    // In development, return as-is if no key is set
    // In production, this should throw an error
    if (process.env.NODE_ENV === "production") {
      throw new Error("ENCRYPTION_KEY must be set in production");
    }
    return token;
  }

  try {
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    if (key.length !== 32) {
      throw new Error("ENCRYPTION_KEY must be a 32-byte hex string (64 characters)");
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(token, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt token");
  }
}

/**
 * Decrypt a token
 */
export function decryptToken(encryptedToken: string): string {
  if (!ENCRYPTION_KEY) {
    // In development, return as-is if no key is set
    if (process.env.NODE_ENV === "production") {
      throw new Error("ENCRYPTION_KEY must be set in production");
    }
    return encryptedToken;
  }

  try {
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const parts = encryptedToken.split(":");
    const iv = Buffer.from(parts.shift()!, "hex");
    const encrypted = Buffer.from(parts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt token");
  }
}

/**
 * Generate a random encryption key (for setup)
 * Run this once to generate a key: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}

