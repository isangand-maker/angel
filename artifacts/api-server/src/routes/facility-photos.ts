import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, facilityPhotosTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/facility-photos", async (_req, res) => {
  const photos = await db.select().from(facilityPhotosTable).orderBy(asc(facilityPhotosTable.sortOrder));
  res.json(photos);
});

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  imageUrl: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

router.post("/admin/facility-photos", requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [photo] = await db.insert(facilityPhotosTable).values(parsed.data).returning();
  res.status(201).json(photo);
});

const updateSchema = createSchema.partial();

router.put("/admin/facility-photos/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success || Number.isNaN(id)) {
    res.status(400).json({ error: "입력값을 확인해주세요." });
    return;
  }
  const [photo] = await db
    .update(facilityPhotosTable)
    .set(parsed.data)
    .where(eq(facilityPhotosTable.id, id))
    .returning();
  if (!photo) {
    res.status(404).json({ error: "사진을 찾을 수 없습니다." });
    return;
  }
  res.json(photo);
});

router.delete("/admin/facility-photos/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  await db.delete(facilityPhotosTable).where(eq(facilityPhotosTable.id, id));
  res.json({ ok: true });
});

export default router;
