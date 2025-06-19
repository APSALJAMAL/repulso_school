import express from "express";
import {
  createBoard,
  getBoards,
  updateBoard,
  deleteBoard,
  getMessagesForBoard,
  createMessage,
  updateMessage,
  deleteMessage,
} from "../controllers/announcement controller";
import { protect } from "../middleware/authMiddleware";
import { access } from "../middleware/accessMiddleware";

const router = express.Router();

router.post("/board",protect,access, createBoard);
router.get("/boards", getBoards);
router.put("/board/:id", updateBoard);
router.delete("/board/:id", deleteBoard);

router.get("/board/:boardId/messages", getMessagesForBoard);
router.post("/message", createMessage);
router.put("/message/:id", updateMessage);
router.delete("/message/:id", deleteMessage);

export default router;
