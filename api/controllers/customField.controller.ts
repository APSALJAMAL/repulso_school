import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create a new custom field by admin
export const createCustomField = async (req: Request, res: Response) => {
  try {
    const { userId, label, key, type, required } = req.body;

    const created = await prisma.userCustomField.create({
      data: { userId, label, key, type, required },
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get all custom fields created by admin for a user
export const getCustomFields = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    const fields = await prisma.userCustomField.findMany({
      where: { userId },
      include: { values: true },
    });

    res.json(fields);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update a custom field
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

// Delete a custom field
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

// Add a custom value by user
export const addCustomValue = async (req: Request, res: Response) => {
  try {
    const { fieldId, userId, value } = req.body;

    const created = await prisma.userCustomFieldValue.create({
      data: { fieldId, userId, value },
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get all values for a user
export const getCustomValues = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    const values = await prisma.userCustomFieldValue.findMany({
      where: { userId },
      include: { field: true },
    });

    res.json(values);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Update a user's custom value
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

// Delete a custom value
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

// Get all custom fields (admin/global)
export const getAllCustomFields = async (req: Request, res: Response) => {
  try {
    const fields = await prisma.userCustomField.findMany({
      include: {
        user: true,
        values: {
          include: { user: true }
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(fields);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Get all custom values (admin/global)
export const getAllCustomValues = async (req: Request, res: Response) => {
  try {
    const values = await prisma.userCustomFieldValue.findMany({
      include: {
        field: {
          include: { user: true }
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

