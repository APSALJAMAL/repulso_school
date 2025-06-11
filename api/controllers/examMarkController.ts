import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST: Create or update a mark for a student in an exam entry
export const upsertExamMark = async (req: Request, res: Response) => {
  try {
    const { examEntryId, studentId, subjectId, marks } = req.body;

    console.log("👉 Incoming Data:", { examEntryId, studentId, subjectId, marks });

    // Convert marks to number, then round to nearest int
    const parsedMarks = Math.round(Number(marks));
    console.log("👉 Parsed Marks:", parsedMarks, typeof parsedMarks);

    // Validate inputs
    if (
      typeof examEntryId !== "number" ||
      typeof studentId !== "number" ||
      typeof subjectId !== "number" ||
      isNaN(parsedMarks)
    ) {
      return res.status(400).json({
        error:
          "Invalid input. examEntryId, studentId, and subjectId must be numbers, and marks must be a valid number.",
      });
    }

    // Ensure all referenced records exist
    const [examEntry, student, subject] = await Promise.all([
      prisma.examEntry.findUnique({ where: { id: examEntryId } }),
      prisma.user.findUnique({ where: { id: studentId } }),
      prisma.subject.findUnique({ where: { id: subjectId } }),
    ]);

    if (!examEntry || !student || !subject) {
      return res.status(400).json({
        error: "Invalid examEntryId, studentId, or subjectId.",
      });
    }

    // Upsert mark using compound unique key
    const updatedMark = await prisma.examMark.upsert({
      where: {
        examEntryId_studentId_subjectId: {
          examEntryId,
          studentId,
          subjectId,
        },
      },
      update: {
        marks: parsedMarks,
      },
      create: {
        examEntryId,
        studentId,
        subjectId,
        marks: parsedMarks,
      },
    });

    return res.status(200).json({
      message: "Mark saved successfully.",
      data: updatedMark,
    });
  } catch (error: any) {
    console.error("❌ Error in upsertExamMark:", JSON.stringify(error, null, 2));
    return res.status(500).json({
      error: "Internal server error while saving exam mark.",
      details: error?.message || error,
    });
  }
};


export const getMarksByExamId = async (req: Request, res: Response) => {
    try {
      const examId = Number(req.params.examId);
  
      if (isNaN(examId)) {
        return res.status(400).json({
          error: "Invalid examId. Must be a number.",
        });
      }
  
      // 1. Get all examEntries for this exam
      const examEntries = await prisma.examEntry.findMany({
        where: { examId },
        select: { id: true }, // Only fetch IDs
      });
  
      const examEntryIds = examEntries.map((entry) => entry.id);
  
      if (examEntryIds.length === 0) {
        return res.status(404).json({
          error: "No exam entries found for this examId.",
        });
      }
  
      // 2. Fetch all exam marks for the related exam entries
      const marks = await prisma.examMark.findMany({
        where: {
          examEntryId: { in: examEntryIds },
        },
        orderBy: {
          studentId: "asc",
        },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
            },
          },
          examEntry: {
            select: {
              date: true,
              session: true,
              time: true,
              exam: {
                select: {
                  id: true,
                  name: true,
                  group: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
  
      return res.status(200).json({
        message: "All exam marks for this examId fetched successfully.",
        data: marks,
      });
    } catch (error: any) {
      console.error("❌ Error in getMarksByExamId:", error);
      return res.status(500).json({
        error: "Internal server error while fetching exam marks.",
      });
    }
  };
  
