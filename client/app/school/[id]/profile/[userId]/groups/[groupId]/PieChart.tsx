/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import {
  startOfMonth,
  addMonths,
  format,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";
import { Button } from "@/components/ui/button";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HOLIDAY" | "ON_DUTY";

interface Attendance {
  id: number;
  title?: string;
}

interface AttendanceEntry {
  id: number;
  userId: number;
  status: AttendanceStatus;
  date: string;
}

interface Props {
  userId: number;
  attendances: Attendance[];
}

const COLORS: Record<AttendanceStatus, string> = {
  PRESENT: "#4ade80",
  ABSENT: "#f87171",
  LATE: "#facc15",
  HOLIDAY: "#60a5fa",
  ON_DUTY: "#c084fc",
};

const isPresentStatus = (status?: AttendanceStatus) =>
  status === "PRESENT" || status === "ON_DUTY";

export default function UserAttendancePieChart({ userId, attendances }: Props) {
  const [monthStart, setMonthStart] = useState(() => startOfMonth(new Date()));
  const [selectedAttendanceId, setSelectedAttendanceId] = useState<
    number | null
  >(attendances.length > 0 ? attendances[0].id : null);
  const [entries, setEntries] = useState<AttendanceEntry[]>([]);

  const fetchData = async () => {
    if (!selectedAttendanceId) return;

    setEntries([]); // Clear old entries before loading new ones

    const month = format(monthStart, "yyyy-MM");
    try {
      const res = await fetch(
        `http://localhost:5555/api/markattendance/${selectedAttendanceId}/statuses?month=${month}`,
      );
      const data: any[] = await res.json();

      const filtered: AttendanceEntry[] = data
        .filter((entry) => entry.userId === userId)
        .map((entry) => ({
          ...entry,
          date: entry.date.slice(0, 10),
        }));

      setEntries(filtered);
    } catch (err) {
      console.error("Error fetching user attendance", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, selectedAttendanceId, monthStart]);

  const statusCounts = entries.reduce(
    (acc, entry) => {
      const status = entry.status as AttendanceStatus;
      if (acc[status] !== undefined) acc[status]++;
      return acc;
    },
    {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      HOLIDAY: 0,
      ON_DUTY: 0,
    } as Record<AttendanceStatus, number>,
  );

  const pieData = Object.entries(statusCounts)
    .filter((entry): entry is [AttendanceStatus, number] => entry[1] > 0)
    .map(([status, count]) => ({
      name: status,
      value: count,
    }));

  const dates = eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(monthStart),
  });

  const presentCount = dates.filter((d) => {
    const iso = format(d, "yyyy-MM-dd");
    const entry = entries.find((e) => e.date === iso);
    return isPresentStatus(entry?.status);
  }).length;

  const attendancePercentage = dates.length
    ? Math.round((presentCount / dates.length) * 100)
    : 0;

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm space-y-4">
      {/* Dropdown to select attendance */}
      <div className="flex justify-center pb-5">
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-medium text-center">
            Select Attendance Record
          </label>
          <select
            value={selectedAttendanceId ?? ""}
            onChange={(e) => setSelectedAttendanceId(Number(e.target.value))}
            className="border border-gray-300 w-fit rounded p-2"
          >
            {attendances.map((att) => (
              <option key={att.id} value={att.id}>
                {att.title || `Attendance #${att.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex justify-center gap-4 items-center">
        <Button
          variant="outline"
          onClick={() => setMonthStart((d) => addMonths(d, -1))}
        >
          ←
        </Button>
        <h3 className="font-medium text-lg">
          {format(monthStart, "MMMM yyyy")}
        </h3>
        <Button
          variant="outline"
          onClick={() => setMonthStart((d) => addMonths(d, 1))}
        >
          →
        </Button>
      </div>

      <p className="text-center font-semibold">
        Attendance: {attendancePercentage}%
      </p>

      {/* Pie chart */}
      {/* Pie chart */}
      {attendancePercentage > 0 ? (
        <div className="h-72 w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name as keyof typeof COLORS]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="text-center text-sm text-gray-500">
          No attendance data available for this month.
        </p>
      )}
    </div>
  );
}
