import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, popupBannersTable } from "@workspace/db";
import { eq, asc, and, or, isNull, lte, gte, sql } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/popup-banners", async (_req, res) => {
  const today = sql`current_date`;
  const rows = await db
    .select()
    .from(popupBannersTable)
    .where(
      and(
        eq(popupBannersTable.published, true),
        or(isNull(popupBannersTable.startDate), lte(popupBannersTable.startDate, today)),
        or(isNull(popupBannersTable.endDate), gte(popupBannersTable.endDate, today)),
      ),
    )
    .orderBy(asc(popupBannersTable.sortOrder));
  res.json(rows);
});

router.get("/admin/popup-banners", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(popupBannersTable).orderBy(asc(popupBannersTable.sortOrder));
  res.json(rows);
});

const popupSchema = z.object({
  imageUrl: z.string().min(1),
  linkUrl: z.string().nullable().optional(),
  published: z.boolean().default(true),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  sortOrder: z.number().default(0),
});

router.post("/admin/popup-banners", requireAdmin, async (req, res) => {
  const parsed = popupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [row] = await db.insert(popupBannersTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.put("/admin/popup-banners/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = popupSchema.partial().safeParse(req.body);
  if (!parsed.success || Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  const [row] = await db.update(popupBannersTable).set(parsed.data).where(eq(popupBannersTable.id, id)).returning();
  if (!row) {
    res.status(404).json({ error: "팝업을 찾을 수 없습니다." });
    return;
  }
  res.json(row);
});

router.delete("/admin/popup-banners/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  await db.delete(popupBannersTable).where(eq(popupBannersTable.id, id));
  res.json({ ok: true });
});

export default router;
