import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, faqsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/faqs", async (_req, res) => {
  const faqs = await db.select().from(faqsTable).orderBy(asc(faqsTable.sortOrder));
  res.json(faqs);
});

const createSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

router.post("/admin/faqs", requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [faq] = await db.insert(faqsTable).values(parsed.data).returning();
  res.status(201).json(faq);
});

const updateSchema = createSchema.partial();

router.put("/admin/faqs/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success || Number.isNaN(id)) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [faq] = await db.update(faqsTable).set(parsed.data).where(eq(faqsTable.id, id)).returning();
  if (!faq) {
    res.status(404).json({ error: "FAQ를 찾을 수 없습니다." });
    return;
  }
  res.json(faq);
});

router.delete("/admin/faqs/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  await db.delete(faqsTable).where(eq(faqsTable.id, id));
  res.json({ ok: true });
});

export default router;
