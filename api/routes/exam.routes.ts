import express from "express";
import {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,
  createExamEntry,
  updateExamEntry,
  deleteExamEntry,
} from "../controllers/exam.controller";



const router = express.Router();

// Exams
router.post("/", createExam);
router.get("/", getAllExams);
router.get("/:id", getExamById);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);

// Exam Entries
router.post("/entry", createExamEntry);
router.put("/entry/:id", updateExamEntry);
router.delete("/entry/:id", deleteExamEntry);

export default router;
