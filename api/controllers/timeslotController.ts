import { Request, Response } from "express";
import db from "../lib/db";

// 🟢 GET all timeslots
export const getTimeslots = async (_req: Request, res: Response) => {
  try {
    const timeslots = await db.timeslot.findMany({
      orderBy: [
        { dayOfWeek: "asc" },
        { startTime: "asc" }
      ]
    });
    res.json(timeslots);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch timeslots" });
  }
};

// 🟢 POST create new timeslot
export const createTimeslot = async (req: Request, res: Response) => {
  const { dayOfWeek, startTime, endTime } = req.body;
  try {
    const timeslot = await db.timeslot.create({
      data: { dayOfWeek, startTime, endTime }
    });
    res.status(201).json(timeslot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create timeslot" });
  }
};

// 🟡 PUT update timeslot
export const updateTimeslot = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { dayOfWeek, startTime, endTime } = req.body;
  try {
    const timeslot = await db.timeslot.update({
      where: { id: Number(id) },
      data: { dayOfWeek, startTime, endTime }
    });
    res.json(timeslot);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update timeslot" });
  }
};

// 🔴 DELETE timeslot
export const deleteTimeslot = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.timeslot.delete({
      where: { id: Number(id) }
    });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete timeslot" });
  }
};
