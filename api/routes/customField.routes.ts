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


router.post("/fields", createCustomField);//
router.get("/fields/user/:userId", getCustomFields);// 
router.put("/fields/:id", updateCustomField);
router.delete("/fields/:id", deleteCustomField);

router.get("/fields", getAllCustomFields);
router.get("/values", getAllCustomValues);

router.post("/values", addCustomValue);//
router.get("/values/user/:userId", getCustomValues);// 
router.put("/values/:id", updateCustomValue);//
router.delete("/values/:id", deleteCustomValue);//

export default router;
