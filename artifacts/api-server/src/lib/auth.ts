import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-only-secret-change-in-production";

export const AUTH_COOKIE_NAME = "angelshome_admin_session";

export interface AdminTokenPayload {
  adminId: number;
  username: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload;
  } catch {
    return null;
  }
}

export interface AuthedRequest extends Request {
  admin?: AdminTokenPayload;
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  const payload = token ? verifyAdminToken(token) : null;

  if (!payload) {
    res.status(401).json({ error: "인증이 필요합니다." });
    return;
  }

  req.admin = payload;
  next();
}

export const MEMBER_AUTH_COOKIE_NAME = "angelshome_member_session";

export interface MemberTokenPayload {
  memberId: number;
  email: string;
}

export function signMemberToken(payload: MemberTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyMemberToken(token: string): MemberTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as MemberTokenPayload;
  } catch {
    return null;
  }
}

export interface MemberAuthedRequest extends Request {
  member?: MemberTokenPayload;
}

export function requireMember(req: MemberAuthedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[MEMBER_AUTH_COOKIE_NAME];
  const payload = token ? verifyMemberToken(token) : null;

  if (!payload) {
    res.status(401).json({ error: "로그인이 필요합니다." });
    return;
  }

  req.member = payload;
  next();
}
