import express from "express";
import {
  createAttendance,
  getAttendance,
  updateAttendance,
  deleteAttendance,
  markStatus,
  getStatuses,
} from "../controllers/attendanceController";

const router = express.Router();

router.post("/", createAttendance);
router.get("/:groupId", getAttendance); // expects ?title=something
router.put("/:id", updateAttendance);
router.delete("/:id", deleteAttendance);

router.post("/:attendanceId/status", markStatus); // expects { userId, status, date }
router.get("/:attendanceId/statuses", getStatuses);

export default router;
