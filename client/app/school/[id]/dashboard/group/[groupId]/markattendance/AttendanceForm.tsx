/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { createAttendance, fetchAttendance } from "./actions";

interface Props {
  groupId: number;
  onAttendanceLoaded: (data: any) => void;
}

export default function AttendanceForm({ groupId, onAttendanceLoaded }: Props) {
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    console.log("Submit clicked");
    setError("");

    if (!date) {
      setError("Please select a date.");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching attendance for group:", groupId, "on", date);
      const res = await fetchAttendance(groupId, date);
      console.log("Fetch response:", res);

      if (res?.id) {
        console.log("Attendance already exists, loading...");
        onAttendanceLoaded(res);
      } else {
        console.log("Creating new attendance...");
        const created = await createAttendance({ groupId, date, note });
        console.log("Create response:", created);
        onAttendanceLoaded(created);
      }
    } catch (err) {
      setError("Failed to load or create attendance. Try again.");
      console.error("Attendance error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="date">Select Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Optional Note</Label>
        <Input
          id="note"
          placeholder="e.g., Half-day due to event"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Loading..." : "Load Attendance"}
      </Button>
    </div>
  );
}
