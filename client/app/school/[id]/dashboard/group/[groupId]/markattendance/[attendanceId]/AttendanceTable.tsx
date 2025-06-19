/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from "date-fns";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HOLIDAY" | "ON_DUTY";

interface Member {
  id: number;
  name: string;
  rollNumber: string;
}
interface StatusEntry {
  userId: number;
  status: AttendanceStatus;
  date: string; // yyyy-MM-dd
}

interface Props {
  groupId: number;
  attendanceId: number;
  schoolId: string;
}

const statusColors: Record<AttendanceStatus, string> = {
  PRESENT: "bg-green-200 text-green-800",
  ABSENT: "bg-red-200 text-red-800",
  LATE: "bg-yellow-200 text-yellow-800",
  HOLIDAY: "bg-blue-200 text-blue-800",
  ON_DUTY: "bg-purple-200 text-purple-800",
};

const isPresentStatus = (status?: AttendanceStatus) =>
  status === "PRESENT" || status === "ON_DUTY";

export default function MonthlyAttendance({
  groupId,
  attendanceId,
  schoolId,
}: Props) {
  const [monthStart, setMonthStart] = useState(() => startOfMonth(new Date()));
  const [members, setMembers] = useState<Member[]>([]);
  const [entries, setEntries] = useState<StatusEntry[]>([]);

  const dates = eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(monthStart),
  });

  const fetchMembers = async () => {
    try {
      const res = await fetch(
        `http://localhost:5555/api/school/${schoolId}/group/${groupId}/member`,
      );
      const data = await res.json();
      const formatted = Array.isArray(data.members)
        ? data.members.map((m: any) => ({
            id: m.id,
            name: m.fullName,
            rollNumber: m.rollNumber || "N/A",
          }))
        : [];
      setMembers(formatted);
    } catch (err) {
      console.error("Error fetching members", err);
    }
  };

  const fetchEntries = async () => {
    try {
      const m = format(monthStart, "yyyy-MM");
      const res = await fetch(
        `http://localhost:5555/api/markattendance/${attendanceId}/statuses?month=${m}`,
      );
      const data = await res.json();
      const normalized = data.map((entry: any) => ({
        ...entry,
        date: entry.date.slice(0, 10),
      }));
      setEntries(normalized);
    } catch (err) {
      console.error("Error fetching statuses", err);
    }
  };

  const handleStatusChange = async (
    userId: number,
    date: string,
    val: string,
  ) => {
    const status = val as AttendanceStatus;
    await fetch(
      `http://localhost:5555/api/markattendance/${attendanceId}/status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, date, status }),
      },
    );
    fetchEntries();
  };

  const prevMonth = () => setMonthStart((d) => addMonths(d, -1));
  const nextMonth = () => setMonthStart((d) => addMonths(d, +1));

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  useEffect(() => {
    fetchEntries();
  }, [attendanceId, monthStart]);

  return (
    <div className="space-y-4 overflow-x-auto p-4">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={prevMonth}>
          ←
        </Button>
        <h2 className="text-lg font-semibold">
          {format(monthStart, "MMM yyyy")}
        </h2>
        <Button variant="outline" onClick={nextMonth}>
          →
        </Button>
      </div>

      <Card className="overflow-auto">
        <CardContent className="p-0">
          <table className="min-w-full table-fixed border-collapse">
            <thead className="bg-muted">
              <tr>
                <th className="sticky left-0 bg-muted p-2 border">Id</th>
                <th className="sticky left-0 bg-muted p-2 border">Member</th>
                <th className="sticky left-0 bg-muted p-2 border">
                  Roll Number
                </th>
                {dates.map((d) => (
                  <th
                    key={d.toISOString()}
                    className="p-1 text-xs text-center border"
                  >
                    {format(d, "d")}
                  </th>
                ))}
                <th className="p-1 text-xs text-center border bg-muted">%</th>
              </tr>
            </thead>

            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td className="sticky left-0 bg-background p-2 border text-sm">
                    {member.id}
                  </td>
                  <td className="sticky left-0 bg-background p-2 border text-sm">
                    {member.name}
                  </td>
                  <td className="sticky left-0 bg-background p-2 border text-sm">
                    {member.rollNumber || "N/A"}
                  </td>
                  {dates.map((d) => {
                    const iso = format(d, "yyyy-MM-dd");
                    const entry = entries.find(
                      (e) => e.userId === member.id && e.date === iso,
                    );
                    const status = entry?.status as
                      | AttendanceStatus
                      | undefined;
                    return (
                      <td
                        key={iso}
                        className={`p-1 border text-center ${
                          status ? statusColors[status] : ""
                        }`}
                      >
                        <Select
                          value={status}
                          onValueChange={(val) =>
                            handleStatusChange(member.id, iso, val)
                          }
                        >
                          <SelectTrigger className="w-full py-0 h-8 text-xs">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent className="text-xs">
                            {[
                              "PRESENT",
                              "ABSENT",
                              "LATE",
                              "HOLIDAY",
                              "ON_DUTY",
                            ].map((s) => (
                              <SelectItem key={s} value={s}>
                                {s.slice(0, 1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                    );
                  })}
                  <td className="font-semibold text-sm border text-center bg-gray-100">
                    {Math.round(
                      (dates.filter((d) => {
                        const iso = format(d, "yyyy-MM-dd");
                        const entry = entries.find(
                          (e) => e.userId === member.id && e.date === iso,
                        );
                        return isPresentStatus(entry?.status);
                      }).length /
                        dates.length) *
                        100,
                    )}
                    %
                  </td>
                </tr>
              ))}

              <tr className="bg-muted font-medium text-xs text-center">
                <td colSpan={3}>Day%</td>
                {dates.map((d) => {
                  const iso = format(d, "yyyy-MM-dd");
                  const presentCount = members.filter((m) => {
                    const entry = entries.find(
                      (e) => e.userId === m.id && e.date === iso,
                    );
                    return isPresentStatus(entry?.status);
                  }).length;

                  const percentage =
                    Math.round((presentCount / members.length) * 100) || 0;

                  return (
                    <td key={iso} className="border">
                      {percentage}%
                    </td>
                  );
                })}
                <td className="border bg-muted" />
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
