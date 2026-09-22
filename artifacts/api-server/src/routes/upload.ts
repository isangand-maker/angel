import { Router, type IRouter } from "express";
import { requireAdmin } from "../lib/auth";
import { upload, uploadAttachment } from "../lib/uploads";

const router: IRouter = Router();

router.post("/admin/upload", requireAdmin, upload.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "파일이 없습니다." });
    return;
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

router.post("/admin/upload-attachment", requireAdmin, uploadAttachment.single("file"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "파일이 없습니다." });
    return;
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}`, name: req.file.originalname });
});

export default router;
