import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "baznas_ntb_secret";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "DONATUR";
};

export function signToken(user: SessionUser) {
  return jwt.sign(user, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}