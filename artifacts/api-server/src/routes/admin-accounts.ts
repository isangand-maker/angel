import { Router, type IRouter } from "express";
import { z } from "zod/v4";
import { db, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin, hashPassword, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/admin/admins", requireAdmin, async (_req, res) => {
  const admins = await db
    .select({ id: adminUsersTable.id, username: adminUsersTable.username, createdAt: adminUsersTable.createdAt })
    .from(adminUsersTable);
  res.json(admins);
});

const createSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
});

router.post("/admin/admins", requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "아이디는 필수이며 비밀번호는 6자 이상이어야 합니다." });
    return;
  }
  const [existing] = await db
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.username, parsed.data.username))
    .limit(1);
  if (existing) {
    res.status(409).json({ error: "이미 존재하는 아이디입니다." });
    return;
  }
  const passwordHash = await hashPassword(parsed.data.password);
  const [admin] = await db
    .insert(adminUsersTable)
    .values({ username: parsed.data.username, passwordHash })
    .returning({ id: adminUsersTable.id, username: adminUsersTable.username, createdAt: adminUsersTable.createdAt });
  res.status(201).json(admin);
});

router.delete("/admin/admins/:id", requireAdmin, async (req: AuthedRequest, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "잘못된 요청입니다." });
    return;
  }
  if (id === req.admin!.adminId) {
    res.status(400).json({ error: "본인 계정은 삭제할 수 없습니다." });
    return;
  }
  const total = await db.select({ id: adminUsersTable.id }).from(adminUsersTable);
  if (total.length <= 1) {
    res.status(400).json({ error: "마지막 관리자 계정은 삭제할 수 없습니다." });
    return;
  }
  await db.delete(adminUsersTable).where(eq(adminUsersTable.id, id));
  res.json({ ok: true });
});

export default router;
