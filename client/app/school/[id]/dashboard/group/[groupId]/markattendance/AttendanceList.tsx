"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Attendance {
  id: number;
  title: string;
  note?: string;
}

interface Props {
  groupId: number;
  schoolId: string;
}

export default function AttendanceList({ groupId, schoolId }: Props) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selected, setSelected] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const router = useRouter();

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5555/api/markattendance/${groupId}`,
      );
      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received");
      }

      setAttendances(data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Could not fetch attendance list.");
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (attendance: Attendance) => {
    setSelected(attendance);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    try {
      const res = await fetch(
        `http://localhost:5555/api/markattendance/${selected.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: selected.title,
            note: selected.note,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to update attendance");

      setMessage("✅ Attendance updated.");
      setSelected(null);
      fetchAttendances();
    } catch (err: any) {
      setMessage(err.message || "Update failed");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(
        `http://localhost:5555/api/markattendance/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) throw new Error("Failed to delete");

      setMessage("✅ Attendance deleted.");
      fetchAttendances();
    } catch (err: any) {
      setMessage(err.message || "Delete failed");
    }
  };

  const handleCardClick = (attendanceId: number) => {
    router.push(
      `/school/${schoolId}/dashboard/group/${groupId}/markattendance/${attendanceId}`,
    );
  };

  useEffect(() => {
    fetchAttendances();
  }, [groupId]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Attendance Sessions</h2>

      {loading ? (
        <p>Loading...</p>
      ) : attendances.length === 0 ? (
        <p>No attendance records found.</p>
      ) : (
        attendances.map((att) => (
          <Card
            key={att.id}
            className="cursor-pointer hover:shadow-md transition"
            onClick={() => handleCardClick(att.id)}
          >
            <CardContent className="py-4 space-y-2">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold">{att.title}</h3>
                <p className="text-muted-foreground text-sm">
                  Attendance ID: {att.id}
                </p>
                <p className="text-sm text-gray-600">{att.note || "No note"}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(att);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(att.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {selected && (
        <div className="mt-6 p-4 border rounded bg-muted/30">
          <h4 className="font-medium mb-2">Edit Attendance</h4>
          <div className="space-y-2">
            <div>
              <Label>Title</Label>
              <Input
                value={selected.title}
                onChange={(e) =>
                  setSelected({ ...selected, title: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Note</Label>
              <Textarea
                value={selected.note}
                onChange={(e) =>
                  setSelected({ ...selected, note: e.target.value })
                }
              />
            </div>
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </div>
      )}

      {message && (
        <p className="text-sm text-accent-foreground mt-4 font-medium">
          {message}
        </p>
      )}
    </div>
  );
}
