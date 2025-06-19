/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props {
  groupId: number;
}

export default function CreateAttendance({ groupId }: Props) {
  const [title, setTitle] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("http://localhost:5555/api/markattendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, title, note }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create attendance.");
      }

      setMessage("✅ Attendance session created successfully!");
      setTitle("");
      setNote("");
    } catch (error: any) {
      setMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl rounded-2xl border border-border bg-background p-6 shadow-sm space-y-5 transition-all"
    >
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-medium text-primary">
          Attendance Title
        </Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Science Class - June 15"
          required
          className="focus-visible:ring-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note" className="text-base font-medium text-primary">
          Optional Note
        </Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Enter a description or note..."
          rows={4}
          className="resize-none focus-visible:ring-primary"
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full font-semibold tracking-wide"
      >
        {loading ? "Creating..." : "Create Attendance"}
      </Button>

      {message && (
        <p
          className={`text-sm font-medium ${
            message.includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
