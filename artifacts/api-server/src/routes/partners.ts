import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, partnerLogosTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/partners", async (_req, res) => {
  const partners = await db.select().from(partnerLogosTable).orderBy(asc(partnerLogosTable.sortOrder));
  res.json(partners);
});

const createSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().nullable().default(null),
  url: z.string().nullable().default(null),
  sortOrder: z.number().int().default(0),
});

router.post("/admin/partners", requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [partner] = await db.insert(partnerLogosTable).values(parsed.data).returning();
  res.status(201).json(partner);
});

const updateSchema = createSchema.partial();

router.put("/admin/partners/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success || Number.isNaN(id)) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [partner] = await db
    .update(partnerLogosTable)
    .set(parsed.data)
    .where(eq(partnerLogosTable.id, id))
    .returning();
  if (!partner) {
    res.status(404).json({ error: "기관을 찾을 수 없습니다." });
    return;
  }
  res.json(partner);
});

router.delete("/admin/partners/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  await db.delete(partnerLogosTable).where(eq(partnerLogosTable.id, id));
  res.json({ ok: true });
});

export default router;
