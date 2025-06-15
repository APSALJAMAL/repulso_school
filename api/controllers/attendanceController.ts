import { Request, Response } from "express";
import db from "../lib/db";

// Create attendance
export const createAttendance = async (req: Request, res: Response) => {
  try {
    const { title, note, groupId } = req.body;

    const attendance = await db.markAttendance.create({
      data: {
        title,
        note,
        groupId,
      },
    });

    return res.status(201).json(attendance);
  } catch (err) {
    return res
      .status(400)
      .json({ error: "Attendance already exists or invalid data." });
  }
};

// Get attendance by groupId and title
// controllers/attendanceController.ts

export const getAttendance = async (req: Request, res: Response) => {
  const { groupId } = req.params;
  const { title } = req.query;

  try {
    const filters: any = {
      groupId: parseInt(groupId),
    };

    if (title) {
      filters.title = title;
    }

    const attendances = await db.markAttendance.findMany({
      where: filters,
      select: {
        id: true,
        title: true,
        note: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(attendances); // ✅ Return array
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};


// Update attendance note or title
export const updateAttendance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { note, title } = req.body;

  try {
    const updated = await db.markAttendance.update({
      where: { id: parseInt(id) },
      data: { note, title },
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

// Mark or update a user's attendance
export const markStatus = async (req: Request, res: Response) => {
  const { attendanceId } = req.params;
  const { userId, status, date } = req.body;

  try {
    const result = await db.markAttendanceStatus.upsert({
      where: {
        attendanceId_userId_date: {
          attendanceId: parseInt(attendanceId),
          userId,
          date: new Date(date),
        },
      },
      update: {
        status,
      },
      create: {
        attendanceId: parseInt(attendanceId),
        userId,
        status,
        date: new Date(date),
      },
    });

    return res.json(result);
  } catch (err) {
    console.error(err);
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
