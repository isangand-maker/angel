import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  AUTH_COOKIE_NAME,
  requireAdmin,
  signAdminToken,
  verifyPassword,
  type AuthedRequest,
} from "../lib/auth";

const router: IRouter = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post("/admin/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "아이디와 비밀번호를 입력해주세요." });
    return;
  }

  const { username, password } = parsed.data;
  const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, username)).limit(1);

  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    res.status(401).json({ error: "아이디 또는 비밀번호가 올바르지 않습니다." });
    return;
  }

  const token = signAdminToken({ adminId: admin.id, username: admin.username });
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ username: admin.username });
});

router.post("/admin/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ ok: true });
});

router.get("/admin/me", requireAdmin, (req: AuthedRequest, res) => {
  res.json({ username: req.admin!.username });
});

export default router;
