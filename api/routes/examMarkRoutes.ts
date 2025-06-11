import express from "express";
import {
  upsertExamMark,
 
  getMarksByExamId,
} from "../controllers/examMarkController";

const router = express.Router();

router.post("/", upsertExamMark); // POST /api/exam-marks
router.get("/:examId", getMarksByExamId); // GET /api/exam-marks/:examEntryId

export default router;
