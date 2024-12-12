import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// 确保只在服务器端运行
if (process.client) {
  throw new Error("JWT utilities can only be used on server side");
}

export interface TokenPayload {
  userId: number;
}

export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: process.env.TOKEN_EXPIRE });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}
