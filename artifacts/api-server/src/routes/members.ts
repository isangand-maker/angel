import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  MEMBER_AUTH_COOKIE_NAME,
  requireMember,
  signMemberToken,
  hashPassword,
  verifyPassword,
  type MemberAuthedRequest,
} from "../lib/auth";

const router: IRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다."),
  name: z.string().min(1),
  phone: z.string().optional().nullable(),
});

router.post("/members/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "입력값을 확인해주세요." });
    return;
  }
  const { email, password, name, phone } = parsed.data;

  const [existing] = await db.select().from(membersTable).where(eq(membersTable.email, email)).limit(1);
  if (existing) {
    res.status(409).json({ error: "이미 가입된 이메일입니다." });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [member] = await db
    .insert(membersTable)
    .values({ email, passwordHash, name, phone: phone ?? null })
    .returning({ id: membersTable.id, email: membersTable.email, name: membersTable.name });

  const token = signMemberToken({ memberId: member.id, email: member.email });
  res.cookie(MEMBER_AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.status(201).json({ email: member.email, name: member.name });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/members/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "이메일과 비밀번호를 입력해주세요." });
    return;
  }
  const { email, password } = parsed.data;
  const [member] = await db.select().from(membersTable).where(eq(membersTable.email, email)).limit(1);

  if (!member || !(await verifyPassword(password, member.passwordHash))) {
    res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    return;
  }

  const token = signMemberToken({ memberId: member.id, email: member.email });
  res.cookie(MEMBER_AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.json({ email: member.email, name: member.name });
});

router.post("/members/logout", (_req, res) => {
  res.clearCookie(MEMBER_AUTH_COOKIE_NAME);
  res.json({ ok: true });
});

router.get("/members/me", requireMember, async (req: MemberAuthedRequest, res) => {
  const [member] = await db
    .select({ email: membersTable.email, name: membersTable.name })
    .from(membersTable)
    .where(eq(membersTable.id, req.member!.memberId))
    .limit(1);
  if (!member) {
    res.status(401).json({ error: "로그인이 필요합니다." });
    return;
  }
  res.json(member);
});

export default router;
