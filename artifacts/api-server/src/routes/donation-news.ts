import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, donationNewsTable } from "@workspace/db";
import { eq, desc, sql, ilike, or } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/donation-news", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 20));
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const scope = req.query.scope === "all" ? "all" : "title";

  const where = q
    ? scope === "all"
      ? or(ilike(donationNewsTable.title, `%${q}%`), ilike(donationNewsTable.content, `%${q}%`))
      : ilike(donationNewsTable.title, `%${q}%`)
    : undefined;

  const [items, totalRows] = await Promise.all([
    db
      .select()
      .from(donationNewsTable)
      .where(where)
      .orderBy(desc(donationNewsTable.createdAt), desc(donationNewsTable.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: sql<number>`count(*)::int` }).from(donationNewsTable).where(where),
  ]);

  res.json({ items, total: totalRows[0]?.count ?? 0, page, limit });
});

router.get("/donation-news/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  const [row] = await db.select().from(donationNewsTable).where(eq(donationNewsTable.id, id));
  if (!row) {
    res.status(404).json({ error: "소식을 찾을 수 없습니다." });
    return;
  }
  res.json(row);
});

const newsSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().nullable().optional(),
  imageAlign: z.enum(["left", "right", "center"]).optional(),
  attachments: z.array(z.object({ name: z.string(), url: z.string() })).optional(),
});

router.post("/admin/donation-news", requireAdmin, async (req, res) => {
  const parsed = newsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [row] = await db.insert(donationNewsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.put("/admin/donation-news/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = newsSchema.partial().safeParse(req.body);
  if (!parsed.success || Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  const [row] = await db.update(donationNewsTable).set(parsed.data).where(eq(donationNewsTable.id, id)).returning();
  if (!row) {
    res.status(404).json({ error: "소식을 찾을 수 없습니다." });
    return;
  }
  res.json(row);
});

router.delete("/admin/donation-news/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  await db.delete(donationNewsTable).where(eq(donationNewsTable.id, id));
  res.json({ ok: true });
});

export default router;
