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

interface Props {
  userId: number;
  attendanceId: number;
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

export default function UserAttendancePieChart({
  userId,
  attendanceId,
}: Props) {
  const [monthStart, setMonthStart] = useState(() => startOfMonth(new Date()));
  const [entries, setEntries] = useState<any[]>([]);

  const fetchData = async () => {
    const month = format(monthStart, "yyyy-MM");
    try {
      const res = await fetch(
        `http://localhost:5555/api/markattendance/${attendanceId}/statuses?month=${month}`,
      );
      const data = await res.json();
      const filtered = data
        .filter((entry: any) => entry.userId === userId)
        .map((entry: any) => ({
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
  }, [userId, attendanceId, monthStart]);

  const statusCounts = entries.reduce(
    (acc, entry) => {
      acc[entry.status as AttendanceStatus]++;
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
    .filter((entry) => {
      const [, count] = entry as [AttendanceStatus, number];
      return count > 0;
    })
    .map((entry) => {
      const [status, count] = entry as [AttendanceStatus, number];
      return {
        name: status,
        value: count,
      };
    });

  // Dates in the selected month
  const dates = eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(monthStart),
  });

  // Apply same logic: out of full month's days, how many are PRESENT or ON_DUTY
  const presentCount = dates.filter((d) => {
    const iso = format(d, "yyyy-MM-dd");
    const entry = entries.find((e) => e.date === iso);
    return isPresentStatus(entry?.status);
  }).length;

  const attendancePercentage = Math.round((presentCount / dates.length) * 100);

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm space-y-4">
      <div className="flex justify-between items-center">
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
                  fill={COLORS[entry.name as AttendanceStatus]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
