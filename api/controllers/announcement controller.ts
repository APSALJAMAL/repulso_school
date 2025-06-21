import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


export const createBoard = async (req: Request, res: Response) => {
  const { groupId, schoolId, userId } = req.body;

  if (!groupId || !schoolId || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await prisma.announcementBoard.findFirst({
      where: { groupId },
    });

    if (existing) {
      return res.status(400).json({ error: "Board already exists for this group" });
    }

    const board = await prisma.announcementBoard.create({
      data: {
        group: { connect: { id: groupId } },
        school: { connect: { id: schoolId } },
        user: { connect: { id: userId } },
      },
    });

    res.status(201).json(board);
  } catch (error) {
    console.error("Error creating board:", error);
    res.status(500).json({ error: "Failed to create board", detail: error });
  }
};




export const getBoards = async (_req: Request, res: Response) => {
  try {
    const boards = await prisma.announcementBoard.findMany({
      include: { group: true },
    });
    res.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    res.status(500).json({ error: "Error fetching boards" });
  }
};

export const updateBoard = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { groupId } = req.body;

  try {
    const groupExists = await prisma.group.findUnique({
      where: { id: Number(groupId) },
    });

    if (!groupExists) {
      return res.status(400).json({ error: "Group does not exist." });
    }

    const updatedBoard = await prisma.announcementBoard.update({
      where: { id },
      data: { groupId: Number(groupId) },
    });

    res.json(updatedBoard);
  } catch (error) {
    console.error("Error updating board:", error);
    res.status(500).json({ error: "Error updating board", detail: error });
  }
};

export const deleteBoard = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  try {
    await prisma.announcementMessage.deleteMany({ where: { boardId: id } });

    await prisma.announcementBoard.delete({ where: { id } });

    res.json({ message: "Board and its messages deleted successfully" });
  } catch (error) {
    console.error("Error deleting board:", error);
    res.status(500).json({ error: "Error deleting board", detail: error });
  }
};

export const getMessagesForBoard = async (req: Request, res: Response) => {
  const { boardId } = req.params;

  try {
    const messages = await prisma.announcementMessage.findMany({
      where: { boardId: Number(boardId) },
      include: { createdBy: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Error fetching messages", detail: error });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  const { boardId, content, userId } = req.body;

  if (!boardId || !content || !userId) {
    return res
      .status(400)
      .json({ error: "Missing boardId, content, or userId" });
  }

  try {
    const newMessage = await prisma.announcementMessage.create({
      data: {
        content,
        createdBy: { connect: { id: userId } },
        board: { connect: { id: Number(boardId) } },
      },
    });

    res.json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Error creating message", detail: error });
  }
};

export const updateMessage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Missing content" });
  }

  try {
    const updated = await prisma.announcementMessage.update({
      where: { id: Number(id) },
      data: { content },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Error updating message", detail: error });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.announcementMessage.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Error deleting message", detail: error });
  }
};

