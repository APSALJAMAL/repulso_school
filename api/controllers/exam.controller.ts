import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create Exam
 */
export const createExam = async (req: Request, res: Response) => {
  try {
    const { name, batch, groupId } = req.body;

    const exam = await prisma.exam.create({
      data: {
        name,
        batch,
        groupId,
      },
    });

    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ error: "Failed to create exam", details: error });
  }
};

/**
 * Create Exam Entry
 */
export const createExamEntry = async (req: Request, res: Response) => {
  try {
    const { examId, subjectId, maxMarks, minMarks, date, session, time } = req.body;
    console.log("Entry payload:", req.body);


    const entry = await prisma.examEntry.create({
      data: {
        examId,
        subjectId,
        maxMarks,
        minMarks,
        date: new Date(date),
        session,
        time,
      },
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ error: "Failed to create exam entry", details: error });
  }
};

/**
 * Update Exam Entry
 */
export const updateExamEntry = async (req: Request, res: Response) => {
  try {
    const entryId = Number(req.params.id);
    const { maxMarks, minMarks, date, session, time } = req.body;

    const updated = await prisma.examEntry.update({
      where: { id: entryId },
      data: {
        maxMarks,
        minMarks,
        date: date ? new Date(date) : undefined,
        session,
        time,
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Failed to update exam entry", details: error });
  }
};

/**
 * Delete Exam Entry
 */
export const deleteExamEntry = async (req: Request, res: Response) => {
  try {
    const entryId = Number(req.params.id);

    await prisma.examEntry.delete({
      where: { id: entryId },
    });

    res.json({ message: "Exam entry deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete exam entry", details: error });
  }
};

/**
 * Get All Exams
 */
export const getAllExams = async (_req: Request, res: Response) => {
  try {
    const exams = await prisma.exam.findMany({
      include: {
        group: true,
        entries: {
          include: {
            subject: true,
          },
        },
      },
    });

    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: "Failed to get exams", details: error });
  }
};

/**
 * Get Exam by ID
 */
export const getExamById = async (req: Request, res: Response) => {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        group: true,
        entries: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (!exam) return res.status(404).json({ error: "Exam not found" });

    res.json(exam);
  } catch (error) {
    res.status(500).json({ error: "Failed to get exam", details: error });
  }
};

/**
 * Update Exam
 */
export const updateExam = async (req: Request, res: Response) => {
  try {
    const { name, batch, groupId } = req.body;

    const updatedExam = await prisma.exam.update({
      where: { id: Number(req.params.id) },
      data: {
        name,
        batch,
        groupId,
      },
    });

    res.json(updatedExam);
  } catch (error) {
    res.status(500).json({ error: "Failed to update exam", details: error });
  }
};

/**
 * Delete Exam
 */
export const deleteExam = async (req: Request, res: Response) => {
  try {
    await prisma.exam.delete({
      where: { id: Number(req.params.id) },
    });

    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete exam", details: error });
  }
};
