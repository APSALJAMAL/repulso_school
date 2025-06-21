/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
type RoleType = "STUDENT" | "TEACHER";

interface Member {
  id: number;
  name: string;
  rollNumber: string;
  role: RoleType;
}
interface StatusEntry {
  userId: number;
  status: AttendanceStatus;
  date: string;
}

interface Props {
  groupId: number;
  attendanceId: number;
  schoolId: string;
}

const statusColors: Record<AttendanceStatus, string> = {
  PRESENT: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
  ABSENT: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200",
  LATE: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200",
  HOLIDAY: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  ON_DUTY:
    "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
};

const isPresentStatus = (status?: AttendanceStatus) =>
  status === "PRESENT" || status === "ON_DUTY";

export default function MonthlyAttendance({
  groupId,
  attendanceId,
  schoolId,
}: Props) {
  const router = useRouter();
  const [monthStart, setMonthStart] = useState(() => startOfMonth(new Date()));
  const [members, setMembers] = useState<Member[]>([]);
  const [entries, setEntries] = useState<StatusEntry[]>([]);
  const [filter, setFilter] = useState<"ALL" | "STUDENT" | "TEACHER">("ALL");
  const [sortBy, setSortBy] = useState<"NAME" | "ROLL">("NAME");

  const dates = eachDayOfInterval({
    start: monthStart,
    end: endOfMonth(monthStart),
  });

  const fetchMembers = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/school/${schoolId}/group/${groupId}/member`,
      );
      const data = await res.json();
      const formatted = Array.isArray(data.members)
        ? data.members.map((m: any) => ({
            id: m.id,
            name: m.fullName,
            rollNumber: m.rollNumber || "N/A",
            role: m.role || "STUDENT", // mock fallback
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/markattendance/${attendanceId}/statuses?month=${m}`,
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
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/markattendance/${attendanceId}/status`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, date, status }),
      },
    );
    fetchEntries();
  };

  const prevMonth = () => setMonthStart((d) => addMonths(d, -1));
  const nextMonth = () => setMonthStart((d) => addMonths(d, 1));

  useEffect(() => {
    fetchMembers();
  }, [groupId]);

  useEffect(() => {
    fetchEntries();
  }, [attendanceId, monthStart]);

  const filteredMembers = members
    .filter((m) => (filter === "ALL" ? true : m.role === filter))
    .sort((a, b) => {
      return sortBy === "NAME"
        ? a.name.localeCompare(b.name)
        : a.rollNumber.localeCompare(b.rollNumber);
    });

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border">
      {/* Header & Back */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="rounded-md"
        >
          ← Back
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={prevMonth}>
            ← Previous
          </Button>
          <h2 className="text-xl font-bold tracking-wide text-primary">
            {format(monthStart, "MMMM yyyy")}
          </h2>
          <Button variant="outline" onClick={nextMonth}>
            Next →
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={() => setFilter("ALL")}
            variant={filter === "ALL" ? "default" : "outline"}
          >
            All
          </Button>
          <Button
            onClick={() => setFilter("STUDENT")}
            variant={filter === "STUDENT" ? "default" : "outline"}
          >
            Students
          </Button>
          <Button
            onClick={() => setFilter("TEACHER")}
            variant={filter === "TEACHER" ? "default" : "outline"}
          >
            Teachers
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm">Sort By:</label>
          <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
            <SelectTrigger className="w-32 h-8 text-xs rounded-md border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="NAME">Name</SelectItem>
              <SelectItem value="ROLL">Roll Number</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        {Object.entries(statusColors).map(([key, value]) => (
          <div key={key} className={`px-2 py-1 rounded ${value}`}>
            {key}
          </div>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-x-auto rounded-xl">
        <CardContent className="p-0">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-muted dark:bg-zinc-800 sticky top-0 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <tr>
                <th className="sticky left-0 z-20 bg-muted dark:bg-zinc-800 px-2 py-2 border">
                  ID
                </th>
                <th className="sticky left-0 z-20 bg-muted dark:bg-zinc-800 px-2 py-2 border">
                  Member
                </th>
                <th className="sticky left-0 z-20 bg-muted dark:bg-zinc-800 px-2 py-2 border">
                  Roll #
                </th>
                <th className="px-2 py-2 border">Role</th>
                {dates.map((d) => (
                  <th
                    key={d.toISOString()}
                    className="px-1 py-1 text-center border"
                  >
                    {format(d, "d")}
                  </th>
                ))}
                <th className="px-1 py-1 border bg-muted">%</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-muted/50 transition">
                  <td className="sticky left-0 bg-background dark:bg-zinc-900 px-2 py-2 border">
                    {member.id}
                  </td>
                  <td className="sticky left-0 bg-background dark:bg-zinc-900 px-2 py-2 border">
                    {member.name}
                  </td>
                  <td className="sticky left-0 bg-background dark:bg-zinc-900 px-2 py-2 border">
                    {member.rollNumber}
                  </td>
                  <td className="text-center border">{member.role}</td>
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
                        className={`p-1 text-center border ${
                          status ? statusColors[status] : ""
                        }`}
                      >
                        <Select
                          value={status}
                          onValueChange={(val) =>
                            handleStatusChange(member.id, iso, val)
                          }
                        >
                          <SelectTrigger className="w-full h-8 text-xs rounded-md bg-background border hover:ring-1 ring-primary">
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
                  <td className="font-bold border text-center bg-emerald-50 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
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
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
