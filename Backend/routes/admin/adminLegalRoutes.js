import express from "express";
import * as adminLegalController from "../../controllers/admin/adminLegalController.js";
import { isAuthenticated as protectAdmin } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// All routes are protected by admin auth
router.use(protectAdmin);

router.get("/all", adminLegalController.getAllLegalDocs);
router.get("/:slug", adminLegalController.getLegalDocBySlug);
router.post("/upsert", adminLegalController.upsertLegalDoc);
router.delete("/:slug", adminLegalController.deleteLegalDoc);

export default router;
