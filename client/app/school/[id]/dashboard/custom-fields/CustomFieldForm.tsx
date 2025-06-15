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

const fieldTypes: FieldType[] = ["TEXT", "NUMBER", "DATE", "BOOLEAN"];

interface Props {
  userId: number;
  onSuccess: () => void;
  fieldToEdit?: CustomField | null;
  onCancel?: () => void;
}

export default function CustomFieldForm({
  userId,
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

  useEffect(() => {
    if (fieldToEdit) {
      setForm({
        label: fieldToEdit.label,
        key: fieldToEdit.key,
        type: fieldToEdit.type,
        required: fieldToEdit.required,
      });
    } else {
      setForm({ label: "", key: "", type: "TEXT", required: false });
    }
  }, [fieldToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (fieldToEdit) {
        await api.put(`/fields/${fieldToEdit.id}`, form);
        toast.success("Field updated!");
      } else {
        await api.post("/fields", { ...form, userId });
        toast.success("Field created!");
      }
      onSuccess();
      if (onCancel) onCancel();
      setForm({ label: "", key: "", type: "TEXT", required: false });
    } catch {
      toast.error("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!fieldToEdit) return;
    try {
      await api.delete(`/fields/${fieldToEdit.id}`);
      toast.success("Field deleted!");
      onSuccess();
      if (onCancel) onCancel();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Label</Label>
        <Input
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
        />
      </div>

      <div>
        <Label>Key</Label>
        <Input
          value={form.key}
          onChange={(e) => setForm({ ...form, key: e.target.value })}
        />
      </div>

      <div>
        <Label>Type</Label>
        <Select
          value={form.type}
          onValueChange={(value) =>
            setForm({ ...form, type: value as FieldType })
          }
        >
          <SelectTrigger>
            <SelectValue />
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

      <div className="flex items-center gap-2">
        <Checkbox
          id="required"
          checked={form.required}
          onCheckedChange={(v) => setForm({ ...form, required: v === true })}
        />
        <Label htmlFor="required">Required</Label>
      </div>

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
