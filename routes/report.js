// backend/routes/report.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { generateReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/generate", protect, generateReport);

export default router;
