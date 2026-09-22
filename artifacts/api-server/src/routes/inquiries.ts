import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, inquiriesTable, inquiryTypeValues, inquiryStatusValues } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin, hashPassword, verifyPassword } from "../lib/auth";

const router: IRouter = Router();

const submitSchema = z.object({
  type: z.enum(inquiryTypeValues),
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().optional().nullable(),
  message: z.string().min(1),
  password: z.string().min(4).optional(),
  details: z.record(z.string(), z.unknown()).optional().nullable(),
});

router.post("/inquiries", async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const { password, ...rest } = parsed.data;
  const passwordHash = password ? await hashPassword(password) : null;
  const [inquiry] = await db
    .insert(inquiriesTable)
    .values({ ...rest, passwordHash })
    .returning({ id: inquiriesTable.id });
  res.status(201).json({ id: inquiry.id });
});

const lookupSchema = z.object({
  type: z.enum(inquiryTypeValues),
  phone: z.string().min(1),
  password: z.string().min(1),
});

router.post("/inquiries/lookup", async (req, res) => {
  const parsed = lookupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const { type, phone, password } = parsed.data;
  const rows = await db
    .select()
    .from(inquiriesTable)
    .where(and(eq(inquiriesTable.type, type), eq(inquiriesTable.phone, phone)))
    .orderBy(desc(inquiriesTable.createdAt));

  const matches = [];
  for (const row of rows) {
    if (row.passwordHash && (await verifyPassword(password, row.passwordHash))) {
      const { passwordHash, ...safe } = row;
      matches.push(safe);
    }
  }

  if (matches.length === 0) {
    res.status(404).json({ error: "일치하는 신청 내역을 찾을 수 없습니다. 연락처와 비밀번호를 확인해주세요." });
    return;
  }
  res.json(matches);
});

router.get("/admin/inquiries", requireAdmin, async (req, res) => {
  const type = typeof req.query.type === "string" ? req.query.type : undefined;
  const rows = await db
    .select()
    .from(inquiriesTable)
    .where(type ? eq(inquiriesTable.type, type) : undefined)
    .orderBy(desc(inquiriesTable.createdAt));
  res.json(rows);
});

const updateStatusSchema = z.object({
  status: z.enum(inquiryStatusValues).optional(),
  adminReply: z.string().nullable().optional(),
});

router.patch("/admin/inquiries/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success || Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  const [inquiry] = await db
    .update(inquiriesTable)
    .set(parsed.data)
    .where(eq(inquiriesTable.id, id))
    .returning();
  if (!inquiry) {
    res.status(404).json({ error: "신청 내역을 찾을 수 없습니다." });
    return;
  }
  res.json(inquiry);
});

router.delete("/admin/inquiries/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  await db.delete(inquiriesTable).where(eq(inquiriesTable.id, id));
  res.json({ ok: true });
});

export default router;
