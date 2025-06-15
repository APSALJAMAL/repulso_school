/* eslint-disable prettier/prettier */
"use client";

import { useState, useEffect } from "react";
import { Attendance } from "@/types/markattendance";
import { fetchAttendance } from "./api";
import { Button } from "@/components/ui/button";
import StatusModal from "./StatusModal";

export default function AttendanceList({ groupId }: { groupId: string }) {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [selected, setSelected] = useState<Attendance | null>(null);

  useEffect(() => {
    fetchAttendance(groupId).then((res) => {
      setAttendanceList(res.data);
    });
  }, [groupId]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Attendance Sessions</h2>
      {attendanceList.map((att) => (
        <div
          key={att.id}
          className="flex justify-between items-center border p-4 rounded"
        >
          <div>
            <p>{new Date(att.date).toLocaleDateString()}</p>
            <p className="text-sm text-muted-foreground">{att.note}</p>
          </div>
          <Button onClick={() => setSelected(att)}>View Status</Button>
        </div>
      ))}

      {selected && (
        <StatusModal
          attendance={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
