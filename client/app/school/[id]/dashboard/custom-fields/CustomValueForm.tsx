/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "./api";

interface Props {
  fieldId: number;
  userId: number;
  onSuccess: () => void;
}

export default function CustomValueForm({ fieldId, userId, onSuccess }: Props) {
  const [value, setValue] = useState("");
  const [existingId, setExistingId] = useState<number | null>(null);

  const fetchValue = async () => {
    try {
      const res = await api.get(`/values/user/${userId}`);
      const current = res.data.find((v: any) => v.fieldId === fieldId);
      if (current) {
        setValue(current.value);
        setExistingId(current.id);
      } else {
        setValue("");
        setExistingId(null);
      }
    } catch {
      toast.error("Failed to fetch value.");
    }
  };

  useEffect(() => {
    fetchValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { fieldId, userId, value };
    try {
      if (existingId) {
        await api.put(`/values/${existingId}`, payload);
        toast.success("Value updated!");
      } else {
        await api.post("/values", payload);
        toast.success("Value created!");
      }
      setValue("");
      setExistingId(null);
      onSuccess();
      fetchValue();
    } catch {
      toast.error("Failed to save value.");
    }
  };

  const handleDelete = async () => {
    try {
      if (existingId) {
        await api.delete(`/values/${existingId}`);
        toast.success("Value deleted!");
        setValue("");
        setExistingId(null);
        onSuccess();
      }
    } catch {
      toast.error("Failed to delete value.");
    }
  };

  return (
    <form onSubmit={handleSave} className="mt-2 flex flex-col gap-3">
      <Input
        placeholder="Enter value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit">{existingId ? "Update" : "Save"}</Button>
        {existingId && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Value?</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete this value?</p>
              <DialogFooter className="mt-4">
                <Button variant="ghost">Cancel</Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Confirm Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </form>
  );
}
