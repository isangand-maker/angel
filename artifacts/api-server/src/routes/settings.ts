import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, siteSettingsTable } from "@workspace/db";
import { requireAdmin } from "../lib/auth";

const router: IRouter = Router();

router.get("/settings", async (_req, res) => {
  const rows = await db.select().from(siteSettingsTable);
  const settings: Record<string, unknown> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  res.json(settings);
});

const updateSettingsSchema = z.record(z.string(), z.unknown());

router.put("/admin/settings", requireAdmin, async (req, res) => {
  const parsed = updateSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }

  const entries = Object.entries(parsed.data);
  for (const [key, value] of entries) {
    await db
      .insert(siteSettingsTable)
      .values({ key, value: value as object, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettingsTable.key,
        set: { value: value as object, updatedAt: new Date() },
      });
  }

  res.json({ ok: true });
});

export default router;
