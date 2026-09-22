import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, deviceTokensTable, adminUsersTable, membersTable } from "@workspace/db";
import { eq, sql, isNotNull, inArray } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

const registerSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android"]),
});

router.post("/push-tokens", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const { token, platform } = parsed.data;
  await db
    .insert(deviceTokensTable)
    .values({ token, platform })
    .onConflictDoUpdate({
      target: deviceTokensTable.token,
      set: { platform, updatedAt: sql`now()` },
    });
  res.status(201).json({ ok: true });
});

const linkSchema = z
  .object({
    token: z.string().min(1),
    adminUsername: z.string().min(1).optional(),
    memberEmail: z.string().email().optional(),
  })
  .refine((v) => !!v.adminUsername !== !!v.memberEmail, {
    message: "adminUsername 또는 memberEmail 중 하나만 지정해야 합니다.",
  });

router.post("/push-tokens/link", async (req, res) => {
  const parsed = linkSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const { token, adminUsername, memberEmail } = parsed.data;

  if (adminUsername) {
    const [admin] = await db.select().from(adminUsersTable).where(eq(adminUsersTable.username, adminUsername)).limit(1);
    if (!admin) {
      res.status(404).json({ error: "존재하지 않는 관리자입니다." });
      return;
    }
  } else if (memberEmail) {
    const [member] = await db.select().from(membersTable).where(eq(membersTable.email, memberEmail)).limit(1);
    if (!member) {
      res.status(404).json({ error: "존재하지 않는 회원입니다." });
      return;
    }
  }

  const [row] = await db
    .update(deviceTokensTable)
    .set({
      adminUsername: adminUsername ?? null,
      memberEmail: memberEmail ?? null,
      updatedAt: sql`now()`,
    })
    .where(eq(deviceTokensTable.token, token))
    .returning();
  if (!row) {
    res.status(404).json({ error: "등록되지 않은 토큰입니다." });
    return;
  }
  res.json({ ok: true });
});

router.get("/admin/push-tokens/admins", requireAdmin, async (_req, res) => {
  const rows = await db
    .selectDistinct({ adminUsername: deviceTokensTable.adminUsername })
    .from(deviceTokensTable)
    .where(isNotNull(deviceTokensTable.adminUsername));
  res.json(rows.map((r) => r.adminUsername).filter(Boolean));
});

const sendSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  target: z.string().min(1), // "all" or a specific adminUsername
});

router.post("/admin/push/send", requireAdmin, async (req, res) => {
  const parsed = sendSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const { title, body, target } = parsed.data;

  const rows =
    target === "all"
      ? await db.select({ token: deviceTokensTable.token }).from(deviceTokensTable)
      : await db
          .select({ token: deviceTokensTable.token })
          .from(deviceTokensTable)
          .where(eq(deviceTokensTable.adminUsername, target));

  if (rows.length === 0) {
    res.status(400).json({ error: "발송 대상 기기가 없습니다." });
    return;
  }

  const messages = rows.map((r) => ({ to: r.token, title, body, sound: "default" }));
  const chunks: (typeof messages)[] = [];
  for (let i = 0; i < messages.length; i += 100) chunks.push(messages.slice(i, i + 100));

  let sent = 0;
  for (const chunk of chunks) {
    const pushRes = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(chunk),
    });
    if (pushRes.ok) sent += chunk.length;
  }

  res.json({ ok: true, targeted: rows.length, sent });
});

export default router;
