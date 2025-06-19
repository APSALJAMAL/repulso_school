export type FieldType = "TEXT" | "NUMBER" | "DATE" | "BOOLEAN";

export interface CustomField {
  id: number;
  userId: number;
  label: string;
  key: string;
  type: FieldType;
  required: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomValue {
  id: number;
  fieldId: number;
  userId: number;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: string; // e.g., "STUDENT", "TEACHER"
  groups: Group[];
  schoolId?: string;
  rollNumber?: string;
}

// Inside @/types/custom.ts

export interface Group {
  id: string;
  name: string;
  parentId: number | null;
}
