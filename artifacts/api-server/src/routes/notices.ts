import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, noticesTable, noticeCommentsTable } from "@workspace/db";
import { eq, desc, asc, sql, and, or, ilike } from "drizzle-orm";
import { requireAdmin, verifyAdminToken, AUTH_COOKIE_NAME } from "../lib/auth";

const router: IRouter = Router();

function isAdminRequest(req: import("express").Request): boolean {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  return !!(token && verifyAdminToken(token));
}

router.get("/notices", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(1000, Math.max(1, Number(req.query.limit) || 20));
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const scope = req.query.scope === "all" ? "all" : "title";
  const admin = isAdminRequest(req);

  const searchWhere = q
    ? scope === "all"
      ? or(ilike(noticesTable.title, `%${q}%`), ilike(noticesTable.content, `%${q}%`))
      : ilike(noticesTable.title, `%${q}%`)
    : undefined;
  const where = admin ? searchWhere : and(eq(noticesTable.hidden, false), searchWhere);

  const [items, totalRows] = await Promise.all([
    db
      .select()
      .from(noticesTable)
      .where(where)
      .orderBy(desc(noticesTable.pinned), desc(noticesTable.createdAt), desc(noticesTable.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ count: sql<number>`count(*)::int` }).from(noticesTable).where(where),
  ]);

  res.json({ items, total: totalRows[0]?.count ?? 0, page, limit });
});

router.get("/notices/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  const admin = isAdminRequest(req);
  const [existing] = await db.select().from(noticesTable).where(eq(noticesTable.id, id));
  if (!existing || (existing.hidden && !admin)) {
    res.status(404).json({ error: "공지사항을 찾을 수 없습니다." });
    return;
  }
  const [notice] = await db
    .update(noticesTable)
    .set({ viewCount: sql`${noticesTable.viewCount} + 1` })
    .where(eq(noticesTable.id, id))
    .returning();
  if (!notice) {
    res.status(404).json({ error: "공지사항을 찾을 수 없습니다." });
    return;
  }
  res.json(notice);
});

const attachmentSchema = z.object({ name: z.string(), url: z.string() });

const createSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  author: z.string().min(1).default("관리자"),
  pinned: z.boolean().default(false),
  hidden: z.boolean().default(false),
  attachments: z.array(attachmentSchema).default([]),
});

router.post("/admin/notices", requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [notice] = await db.insert(noticesTable).values(parsed.data).returning();
  res.status(201).json(notice);
});

const updateSchema = createSchema.partial();

router.put("/admin/notices/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success || Number.isNaN(id)) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [notice] = await db
    .update(noticesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(noticesTable.id, id))
    .returning();
  if (!notice) {
    res.status(404).json({ error: "공지사항을 찾을 수 없습니다." });
    return;
  }
  res.json(notice);
});

router.delete("/admin/notices/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  await db.delete(noticesTable).where(eq(noticesTable.id, id));
  res.json({ ok: true });
});

// Comments

router.get("/notices/:id/comments", async (req, res) => {
  const noticeId = Number(req.params.id);
  if (Number.isNaN(noticeId)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  const comments = await db
    .select()
    .from(noticeCommentsTable)
    .where(eq(noticeCommentsTable.noticeId, noticeId))
    .orderBy(asc(noticeCommentsTable.createdAt));
  res.json(comments);
});

const createCommentSchema = z.object({
  authorName: z.string().min(1).max(50),
  content: z.string().min(1).max(1000),
});

router.post("/notices/:id/comments", async (req, res) => {
  const noticeId = Number(req.params.id);
  const parsed = createCommentSchema.safeParse(req.body);
  if (!parsed.success || Number.isNaN(noticeId)) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [notice] = await db.select({ id: noticesTable.id }).from(noticesTable).where(eq(noticesTable.id, noticeId));
  if (!notice) {
    res.status(404).json({ error: "공지사항을 찾을 수 없습니다." });
    return;
  }
  const [comment] = await db
    .insert(noticeCommentsTable)
    .values({ noticeId, ...parsed.data })
    .returning();
  res.status(201).json(comment);
});

router.delete("/admin/notice-comments/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  await db.delete(noticeCommentsTable).where(eq(noticeCommentsTable.id, id));
  res.json({ ok: true });
});

export default router;
