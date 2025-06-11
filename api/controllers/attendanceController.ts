import { Request, Response } from "express";
import db from "../lib/db"; // assuming this is your Prisma instance

// Create attendance
export const createAttendance = async (req: Request, res: Response) => {
  try {
    const { date, note, groupId } = req.body;
    const attendance = await db.markAttendance.create({
      data: {
        date: new Date(date),
        note,
        groupId,
      },
    });
    return res.status(201).json(attendance);
  } catch (err) {
    return res.status(400).json({ error: "Attendance already exists or invalid data." });
  }
};

// Get attendance for group and date
export const getAttendance = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { date } = req.query;

  try {
    const attendance = await db.markAttendance.findFirst({
      where: {
        groupId: parseInt(groupId),
        date: new Date(date as string),
      },
      include: { statuses: true },
    });

    if (!attendance) return res.status(404).json({ error: "Attendance not found" });
    return res.json(attendance);
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};

// Update attendance
export const updateAttendance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { note } = req.body;

  try {
    const updated = await db.markAttendance.update({
      where: { id: parseInt(id) },
      data: { note },
    });
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: "Could not update attendance" });
  }
};

// Delete attendance
export const deleteAttendance = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.markAttendance.delete({ where: { id: parseInt(id) } });
    return res.json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(400).json({ error: "Delete failed" });
  }
};

// Mark a user's attendance
export const markStatus = async (req: Request, res: Response) => {
  const { attendanceId } = req.params;
  const { userId, status } = req.body;

  try {
    const existing = await db.markAttendanceStatus.findFirst({
      where: {
        attendanceId: parseInt(attendanceId),
        userId,
      },
    });

    const result = existing
      ? await db.markAttendanceStatus.update({
          where: {
            attendanceId_userId: {
              attendanceId: parseInt(attendanceId),
              userId,
            },
          },
          data: { status },
        })
      : await db.markAttendanceStatus.create({
          data: {
            attendanceId: parseInt(attendanceId),
            userId,
            status,
          },
        });

    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: "Marking failed" });
  }
};

// Get all statuses for a session
export const getStatuses = async (req: Request, res: Response) => {
  const { attendanceId } = req.params;

  try {
    const statuses = await db.markAttendanceStatus.findMany({
      where: { attendanceId: parseInt(attendanceId) },
      include: { user: true },
    });

    return res.json(statuses);
  } catch (err) {
    return res.status(500).json({ error: "Could not fetch statuses" });
  }
};
