import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get all entries for a group
router.get("/group/:groupId", async (req, res) => {
  const groupId = parseInt(req.params.groupId);
  try {
    const entries = await prisma.timetableEntry.findMany({
      where: { groupId },
      include: {
        subject: true,
        teacher: true,
        timeslot: true,
      },
      orderBy: { timeslot: { dayOfWeek: 'asc' } },
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Error fetching timetable", error: err });
  }
});

// Create
router.post("/", async (req, res) => {
  const { groupId, subjectId, teacherId, timeslotId, room, notes, weekType } = req.body;
  try {
    const entry = await prisma.timetableEntry.create({
      data: {
        groupId,
        subjectId,
        teacherId,
        timeslotId,
        room,
        notes,
        weekType,
      },
    });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: "Error creating timetable entry", error: err });
  }
});

// Update
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { subjectId, teacherId, timeslotId, room, notes, weekType } = req.body;
  try {
    const updated = await prisma.timetableEntry.update({
      where: { id },
      data: {
        subjectId,
        teacherId,
        timeslotId,
        room,
        notes,
        weekType,
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating entry", error: err });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.timetableEntry.delete({ where: { id } });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting entry", error: err });
  }
});

export default router;
