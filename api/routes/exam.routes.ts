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
  getExamsByUserId,
  getExamsBySchool,
} from "../controllers/exam.controller";
import db from "../lib/db";
import { protect } from "../middleware/authMiddleware";
import { access } from "../middleware/accessMiddleware";



const router = express.Router();

// Exams
router.post("/",protect,access,createExam);
router.get("/", getAllExams);

router.get("/:id", getExamById);
router.get("/school/:schoolId", getExamsBySchool);
router.put("/:id", updateExam);
router.delete("/:id", deleteExam);
router.get("/user/:userId", getExamsByUserId);

// Exam Entries
router.post("/entry", createExamEntry);
router.put("/entry/:id", updateExamEntry);
router.delete("/entry/:id", deleteExamEntry);

// Example in Express
router.get("/:examId/user/:userId", async (req, res) => {
  const { examId, userId } = req.params;

  try {
    const marks = await db.examMark.findMany({
      where: {
        studentId: Number(userId),
        examEntry: {
          examId: Number(examId),
        },
      },
      include: {
        subject: true,
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        examEntry: {
          include: {
            subject: true, // to access subject info
            exam: true,    // optional if you want exam name
          },
        },
      },
    });

    // Optional: group by exam if needed
    res.json({
      examId: Number(examId),
      studentId: Number(userId),
      data: marks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch marks with entry details" });
  }
});



export default router;
