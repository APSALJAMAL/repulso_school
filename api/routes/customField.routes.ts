import express from "express";
import {
  createCustomField,
  getCustomFields,
  updateCustomField,
  deleteCustomField,
  addCustomValue,
  getCustomValues,
  updateCustomValue,
  deleteCustomValue,
  getAllCustomFields,
  getAllCustomValues,
} from "../controllers/customField.controller";

const router = express.Router();

// 📌 Custom field endpoints
router.post("/fields", createCustomField);
router.get("/fields/school/:schoolId", getCustomFields);
router.get("/fields", getAllCustomFields);
router.put("/fields/:id", updateCustomField);
router.delete("/fields/:id", deleteCustomField);

// 📌 Custom value endpoints
router.post("/values", addCustomValue);
router.get("/values/school/:schoolId", getCustomValues);
router.get("/values", getAllCustomValues);
router.put("/values/:id", updateCustomValue);
router.delete("/values/:id", deleteCustomValue);

export default router;
