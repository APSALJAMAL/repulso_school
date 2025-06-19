import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Create a new custom field
export const createCustomField = async (req: Request, res: Response) => {
  try {
    const { userId, schoolId, label, key, type, required } = req.body;

    if (!userId || !schoolId || !label || !key || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const created = await prisma.userCustomField.create({
      data: {
        userId,
        schoolId,
        label,
        key,
        type,
        required,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ✅ Get custom fields by school
export const getCustomFields = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    const fields = await prisma.userCustomField.findMany({
      where: { schoolId },
      include: { values: true },
    });

    res.json(fields);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ✅ Update a custom field
export const updateCustomField = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { label, key, type, required } = req.body;

    const updated = await prisma.userCustomField.update({
      where: { id: Number(id) },
      data: { label, key, type, required },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ✅ Delete a custom field
export const deleteCustomField = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.userCustomField.delete({
      where: { id: Number(id) },
    });

    res.json(deleted);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ✅ Add or update a custom value
export const addCustomValue = async (req: Request, res: Response) => {
  try {
    const { fieldId, userId, value, schoolId } = req.body;

    if (!fieldId || !userId || !value || !schoolId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const membership = await prisma.memberOnSchools.findUnique({
      where: {
        userId_schoolId: {
          userId,
          schoolId,
        },
      },
    });

    if (!membership) {
      return res.status(403).json({ error: "User not part of the school" });
    }

    const saved = await prisma.userCustomFieldValue.upsert({
      where: {
        fieldId_userId: {
          fieldId,
          userId,
        },
      },
      update: { value },
      create: { fieldId, userId, value },
    });

    res.status(200).json(saved);
  } catch (error) {
    console.error("❌ Prisma error:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// ✅ Get all custom values by school
export const getCustomValues = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    const members = await prisma.memberOnSchools.findMany({
      where: { schoolId },
      select: { userId: true },
    });

    const userIds = members.map((m) => m.userId);

    const values = await prisma.userCustomFieldValue.findMany({
      where: {
        userId: { in: userIds },
      },
      include: { field: true },
    });

    res.json(values);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ✅ Update a user's custom value
export const updateCustomValue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    const updated = await prisma.userCustomFieldValue.update({
      where: { id: Number(id) },
      data: { value },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ✅ Delete a custom value
export const deleteCustomValue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await prisma.userCustomFieldValue.delete({
      where: { id: Number(id) },
    });

    res.json(deleted);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ✅ Get all fields (admin/global)
export const getAllCustomFields = async (_req: Request, res: Response) => {
  try {
    const fields = await prisma.userCustomField.findMany({
      include: {
        user: true,
        values: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(fields);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// ✅ Get all values (admin/global)
export const getAllCustomValues = async (_req: Request, res: Response) => {
  try {
    const values = await prisma.userCustomFieldValue.findMany({
      include: {
        field: {
          include: { user: true },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(values);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
