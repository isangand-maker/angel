import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, galleryItemsTable } from "@workspace/db";
import { eq, desc, sql, ilike } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/gallery", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 20));
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

  const where = q ? ilike(galleryItemsTable.title, `%${q}%`) : undefined;

  const [items, totalRows] = await Promise.all([
    db
      .select()
      .from(galleryItemsTable)
      .where(where)
      .orderBy(desc(galleryItemsTable.sortOrder), desc(galleryItemsTable.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: sql<number>`count(*)::int` }).from(galleryItemsTable).where(where),
  ]);

  res.json({ items, total: totalRows[0]?.count ?? 0, page, limit });
});

router.get("/gallery/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  const [row] = await db.select().from(galleryItemsTable).where(eq(galleryItemsTable.id, id));
  if (!row) {
    res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    return;
  }
  res.json(row);
});

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().optional(),
  imageUrl: z.string().min(1),
  images: z.array(z.string()).optional(),
});

router.post("/admin/gallery", requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [{ maxOrder }] = await db
    .select({ maxOrder: sql<number>`coalesce(max(${galleryItemsTable.sortOrder}), -1)` })
    .from(galleryItemsTable);
  const images = parsed.data.images?.length ? parsed.data.images : [parsed.data.imageUrl];
  const [item] = await db
    .insert(galleryItemsTable)
    .values({ ...parsed.data, images, sortOrder: maxOrder + 1 })
    .returning();
  res.status(201).json(item);
});

const updateSchema = createSchema.partial().extend({ sortOrder: z.number().int().optional() });

router.put("/admin/gallery/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success || Number.isNaN(id)) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [item] = await db.update(galleryItemsTable).set(parsed.data).where(eq(galleryItemsTable.id, id)).returning();
  if (!item) {
    res.status(404).json({ error: "사진을 찾을 수 없습니다." });
    return;
  }
  res.json(item);
});

router.delete("/admin/gallery/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  await db.delete(galleryItemsTable).where(eq(galleryItemsTable.id, id));
  res.json({ ok: true });
});

export default router;
