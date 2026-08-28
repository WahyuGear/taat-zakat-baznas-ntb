import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "BAZNAS_NTB_SECRET";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DONATUR";

export type JwtPayload = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(
  token: string
): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET);

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "id" in decoded &&
      "name" in decoded &&
      "email" in decoded &&
      "role" in decoded
    ) {
      const role = String(decoded.role);

      if (
        role !== "SUPER_ADMIN" &&
        role !== "ADMIN" &&
        role !== "DONATUR"
      ) {
        return null;
      }

      return {
        id: Number(decoded.id),
        name: String(decoded.name),
        email: String(decoded.email),
        role,
      };
    }

    return null;
  } catch {
    return null;
  }
}