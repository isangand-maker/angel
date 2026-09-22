import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, childcareSharesTable } from "@workspace/db";
import { eq, desc, sql, ilike, or } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/childcare-shares", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 20));
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const scope = req.query.scope === "all" ? "all" : "title";

  const where = q
    ? scope === "all"
      ? or(ilike(childcareSharesTable.title, `%${q}%`), ilike(childcareSharesTable.content, `%${q}%`))
      : ilike(childcareSharesTable.title, `%${q}%`)
    : undefined;

  const [items, totalRows] = await Promise.all([
    db
      .select()
      .from(childcareSharesTable)
      .where(where)
      .orderBy(desc(childcareSharesTable.createdAt), desc(childcareSharesTable.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: sql<number>`count(*)::int` }).from(childcareSharesTable).where(where),
  ]);

  res.json({ items, total: totalRows[0]?.count ?? 0, page, limit });
});

router.get("/childcare-shares/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  const [row] = await db.select().from(childcareSharesTable).where(eq(childcareSharesTable.id, id));
  if (!row) {
    res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    return;
  }
  res.json(row);
});

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  imageUrl: z.string().nullable().default(null),
  attachments: z.array(z.object({ name: z.string(), url: z.string() })).optional(),
});

router.post("/admin/childcare-shares", requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [item] = await db.insert(childcareSharesTable).values(parsed.data).returning();
  res.status(201).json(item);
});

const updateSchema = createSchema.partial();

router.put("/admin/childcare-shares/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success || Number.isNaN(id)) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [item] = await db
    .update(childcareSharesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(childcareSharesTable.id, id))
    .returning();
  if (!item) {
    res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    return;
  }
  res.json(item);
});

router.delete("/admin/childcare-shares/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  await db.delete(childcareSharesTable).where(eq(childcareSharesTable.id, id));
  res.json({ ok: true });
});

export default router;
