"use client";

import { useEffect, useState } from "react";
import { FieldType, CustomField } from "@/types/custom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import api from "./api";
import { toast } from "sonner";
import { getCookie } from "cookies-next";

const fieldTypes: FieldType[] = ["TEXT", "NUMBER", "DATE", "BOOLEAN"];

interface Props {
  userId: number;
  schoolId: string;
  onSuccess: () => void;
  fieldToEdit?: CustomField | null;
  onCancel?: () => void;
}

export default function CustomFieldForm({
  userId,
  schoolId,
  onSuccess,
  fieldToEdit,
  onCancel,
}: Props) {
  const [form, setForm] = useState({
    label: "",
    key: "",
    type: "TEXT" as FieldType,
    required: false,
  });

  const [isKeyDirty, setIsKeyDirty] = useState(false);

  useEffect(() => {
    if (fieldToEdit) {
      setForm({
        label: fieldToEdit.label,
        key: fieldToEdit.key,
        type: fieldToEdit.type,
        required: fieldToEdit.required,
      });
      setIsKeyDirty(true);
    } else {
      resetForm();
    }
  }, [fieldToEdit]);

  const generateKey = (label: string) =>
    label
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  const handleLabelChange = (value: string) => {
    if (!isKeyDirty) {
      setForm((prev) => ({
        ...prev,
        label: value,
        key: generateKey(value),
      }));
    } else {
      setForm((prev) => ({ ...prev, label: value }));
    }
  };

  const handleKeyChange = (value: string) => {
    setIsKeyDirty(true);
    setForm((prev) => ({ ...prev, key: value }));
  };

  const resetForm = () => {
    setForm({ label: "", key: "", type: "TEXT", required: false });
    setIsKeyDirty(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim() || !form.key.trim()) {
      toast.error("Label and key are required");
      return;
    }

    try {
      const token = await getCookie("token");
      const config = {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      };

      if (fieldToEdit) {
        await api.put(`/fields/${fieldToEdit.id}`, form, config);
        toast.success("Field updated!");
      } else {
        await api.post("/fields", { ...form, userId, schoolId }, config);
        toast.success("Field created!");
      }

      resetForm();
      onSuccess();
      if (onCancel) onCancel();
    } catch (error) {
      console.error("Custom field submit error:", error);
      toast.error("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!fieldToEdit) return;
    try {
      const token = await getCookie("token");
      await api.delete(`/fields/${fieldToEdit.id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      toast.success("Field deleted!");
      resetForm();
      onSuccess();
      if (onCancel) onCancel();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Delete failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Label */}
      <div>
        <Label>Label</Label>
        <Input
          value={form.label}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder="e.g. Student Grade"
        />
      </div>

      {/* Key */}
      <div>
        <Label>Key</Label>
        <Input
          value={form.key}
          onChange={(e) => handleKeyChange(e.target.value)}
          placeholder="e.g. student_grade"
        />
      </div>

      {/* Type */}
      <div>
        <Label>Type</Label>
        <Select
          value={form.type}
          onValueChange={(value) =>
            setForm((prev) => ({ ...prev, type: value as FieldType }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {fieldTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Required */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="required"
          checked={form.required}
          onCheckedChange={(v) =>
            setForm((prev) => ({ ...prev, required: v === true }))
          }
        />
        <Label htmlFor="required">Required</Label>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <Button type="submit">{fieldToEdit ? "Update" : "Create"}</Button>
        {fieldToEdit && (
          <>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
