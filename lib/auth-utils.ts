import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt with salt rounds.
 * Much more secure than SHA-256 for password storage.
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a stored hash.
 * Supports both bcrypt and legacy SHA-256 hashes.
 */
export function comparePassword(password: string, hash: string): boolean {
  // bcrypt hashes start with $2a$, $2b$, or $2y$
  if (hash.startsWith("$2")) {
    return bcrypt.compareSync(password, hash);
  }
  // Legacy SHA-256 hash fallback (used by seed data)
  const sha256 = crypto.createHash("sha256").update(password).digest("hex");
  return sha256 === hash;
}

/**
 * Create a new user in the database.
 */
export async function createUser({
  name,
  email,
  phone,
  password,
  role = "user",
}: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("البريد الإلكتروني مسجل بالفعل");
  }

  const passwordHash = hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || "",
      passwordHash,
      role,
    },
  });

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
