import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ Create Announcement Board for a Group
router.post("/board", async (req, res) => {
    const { groupId } = req.body;
  
    if (!groupId || isNaN(Number(groupId))) {
      return res.status(400).json({ error: "Invalid or missing groupId" });
    }
  
    try {
      const board = await prisma.announcementBoard.create({
        data: {
          group: {
            connect: { id: Number(groupId) },
          },
        },
      });
  
      res.status(201).json(board);
    } catch (error) {
      console.error("Error creating board:", error);
      res.status(500).json({ error: "Failed to create board", detail: error });
    }
  });

// Get Boards with group name
router.get("/boards", async (req, res) => {
    try {
      const boards = await prisma.announcementBoard.findMany({
        include: { group: true }, // 👈 include group
      });
  
      res.json(boards);
    } catch (error) {
      console.error("Error fetching boards:", error);
      res.status(500).json({ error: "Error fetching boards" });
    }
  });
  

// PUT: Update Board
router.put("/board/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { groupId } = req.body;
  
    try {
      // Ensure groupId exists
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
  });
  
  
  
  
  // DELETE: Delete Board
  router.delete("/board/:id", async (req, res) => {
    const id = Number(req.params.id);
  
    try {
      // Delete all related messages
      await prisma.announcementMessage.deleteMany({
        where: { boardId: id },
      });
  
      // Now delete the board
      await prisma.announcementBoard.delete({
        where: { id },
      });
  
      res.json({ message: "Board and its messages deleted successfully" });
    } catch (error) {
      console.error("Error deleting board:", error);
      res.status(500).json({ error: "Error deleting board", detail: error });
    }
  });
  
  


// ✅ Get all messages for a board
router.get("/board/:boardId/messages", async (req, res) => {
  const { boardId } = req.params;

  try {
    const messages = await prisma.announcementMessage.findMany({
      where: { boardId: Number(boardId) }, // convert to number
      include: { createdBy: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Error fetching messages", detail: error });
  }
});

// ✅ Create a new announcement message
router.post("/message", async (req, res) => {
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
        createdBy: { connect: { id: userId } }, // assuming userId is a string (uuid/cuid)
        board: { connect: { id: Number(boardId) } }, // convert to number
      },
    });
    res.json(newMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).json({ error: "Error creating message", detail: error });
  }
});

// ✅ Update a message
router.put("/message/:id", async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Missing content in request body" });
  }

  try {
    const updatedMessage = await prisma.announcementMessage.update({
      where: { id: Number(id) }, // convert to number
      data: { content },
    });
    res.json(updatedMessage);
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Error updating message", detail: error });
  }
});

// ✅ Delete a message
router.delete("/message/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.announcementMessage.delete({
      where: { id: Number(id) }, // convert to number
    });
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Error deleting message", detail: error });
  }
});

export default router;
