import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, calendarEventsTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/calendar-events", async (_req, res) => {
  const rows = await db.select().from(calendarEventsTable).orderBy(asc(calendarEventsTable.eventDate));
  res.json(rows);
});

const eventSchema = z.object({
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1),
  detail: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

router.post("/admin/calendar-events", requireAdmin, async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [row] = await db.insert(calendarEventsTable).values(parsed.data).returning();
  res.status(201).json(row);
});

router.put("/admin/calendar-events/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success || Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  const [row] = await db.update(calendarEventsTable).set(parsed.data).where(eq(calendarEventsTable.id, id)).returning();
  if (!row) {
    res.status(404).json({ error: "일정을 찾을 수 없습니다." });
    return;
  }
  res.json(row);
});

router.delete("/admin/calendar-events/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  await db.delete(calendarEventsTable).where(eq(calendarEventsTable.id, id));
  res.json({ ok: true });
});

export default router;
