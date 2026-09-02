import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "BAZNAS_NTB_SECRET"
);

export type EdgeJwtPayload = {
  id: number;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "DONATUR";
};

export async function verifyTokenEdge(
  token: string
): Promise<EdgeJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);

    if (
      typeof payload.id === "undefined" ||
      typeof payload.name !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    const role = payload.role;

    if (
      role !== "SUPER_ADMIN" &&
      role !== "ADMIN" &&
      role !== "DONATUR"
    ) {
      return null;
    }

    return {
      id: Number(payload.id),
      name: payload.name,
      email: payload.email,
      role,
    };
  } catch {
    return null;
  }
}