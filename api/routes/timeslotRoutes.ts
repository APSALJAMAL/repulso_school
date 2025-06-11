import {
    getTimeslots,
    createTimeslot,
    updateTimeslot,
    deleteTimeslot
  } from "../controllers/timeslotController";
  import express from "express";
  const router = express.Router();
 
  router.get("/timeslots",  getTimeslots);
  router.post("/timeslots", createTimeslot);
  router.put("/timeslots/:id",  updateTimeslot);
  router.delete("/timeslots/:id",  deleteTimeslot);
  
  export default router;