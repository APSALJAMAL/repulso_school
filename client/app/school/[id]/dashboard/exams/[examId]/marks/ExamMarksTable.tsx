/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";

interface Props {
  examId: number;
  schoolId: string;
  groupId: string;
}

interface Student {
  id: number;
  fullName: string;
  email: string;
  rollNumber: string;
}

interface ExamMark {
  id: number;
  marks: number;
  student: Student;
  subjectId: number;
  subject: { id: number; name: string };
}

interface ExamEntry {
  subjectId: number;
  subject: { id: number; name: string };
  maxMarks: number;
  minMarks: number;
}

interface StudentRow {
  student: Student;
  marks: { [subjectId: number]: number };
  total: number;
  hasFailed: boolean;
  rank: number | null;
}

export default function ExamMarksTable({ examId, schoolId, groupId }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [entries, setEntries] = useState<ExamEntry[]>([]);
  const [sortKey, setSortKey] = useState<string>("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (key: string) => (
    <span className="ml-1 flex flex-col text-xs">
      <ArrowUp
        size={12}
        className={
          sortKey === key && sortOrder === "asc"
            ? "text-primary"
            : "text-gray-400"
        }
      />
      <ArrowDown
        size={12}
        className={
          sortKey === key && sortOrder === "desc"
            ? "text-primary"
            : "text-gray-400"
        }
      />
    </span>
  );

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [groupRes, marksRes, entriesRes] = await Promise.all([
          axios.get(
            `http://localhost:5555/api/school/${schoolId}/group/${groupId}/member`,
          ),
          axios.get(`http://localhost:5555/api/exam-marks/${examId}`),
          axios.get(`http://localhost:5555/api/exams/${examId}`),
        ]);

        const members = (
          Array.isArray(groupRes.data)
            ? groupRes.data
            : (groupRes.data.members ?? [])
        )
          .filter(
            (m: any) => m.role === "STUDENT" || m.user?.role === "STUDENT",
          )
          .map((m: any) => ({
            id: m.user?.id ?? m.id,
            fullName: m.user?.fullName ?? m.fullName,
            email: m.user?.email ?? m.email,
            rollNumber: m.user?.rollNumber ?? m.rollNumber ?? "-",
          }));

        const marks: ExamMark[] = marksRes.data.data ?? [];
        const examEntries: ExamEntry[] = entriesRes.data.entries ?? [];
        setEntries(examEntries);

        const memberIds = new Set(members.map((m: { id: any }) => m.id));
        const filteredMarks = marks.filter((m) => memberIds.has(m.student.id));

        const studentMap = new Map<number, StudentRow>();

        filteredMarks.forEach((m) => {
          const sid = m.student.id;
          if (!studentMap.has(sid)) {
            const matched = members.find(
              (mem: { id: number }) => mem.id === sid,
            );
            studentMap.set(sid, {
              student: {
                ...m.student,
                rollNumber: matched?.rollNumber || "N/A",
              },
              marks: {},
              total: 0,
              hasFailed: false,
              rank: null,
            });
          }
          const row = studentMap.get(sid)!;
          row.marks[m.subjectId] = m.marks;
        });

        const rows = Array.from(studentMap.values()).map((row) => {
          let total = 0;
          let hasFailed = false;

          for (const e of examEntries) {
            const mark = row.marks[e.subjectId];
            if (typeof mark === "number") {
              total += mark;
              if (mark < e.minMarks) hasFailed = true;
            } else hasFailed = true;
          }

          return { ...row, total, hasFailed };
        });

        const passed = rows
          .filter((r) => !r.hasFailed)
          .sort((a, b) => b.total - a.total);
        let rank = 1,
          lastTotal = -1,
          lastRank = 1;

        for (const student of passed) {
          if (student.total === lastTotal) student.rank = lastRank;
          else {
            student.rank = rank;
            lastRank = rank;
          }
          lastTotal = student.total;
          rank++;
        }

        const finalRows = rows.map(
          (r) => passed.find((p) => p.student.id === r.student.id) ?? r,
        );
        setStudentRows(finalRows);
      } catch (e: any) {
        console.error(e);
        setError(e.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [examId, schoolId, groupId]);

  const sortedRows = [...studentRows].sort((a, b) => {
    let valA: any;
    let valB: any;

    if (sortKey.startsWith("subject-")) {
      const subjectId = parseInt(sortKey.split("-")[1]);
      valA = a.marks[subjectId] ?? 0;
      valB = b.marks[subjectId] ?? 0;
    } else if (sortKey === "total") {
      valA = a.total;
      valB = b.total;
    } else if (sortKey === "rank") {
      valA = a.rank ?? Infinity;
      valB = b.rank ?? Infinity;
    } else {
      valA = a.student[sortKey as keyof Student] ?? "";
      valB = b.student[sortKey as keyof Student] ?? "";
    }

    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  if (loading) return <p className="py-10 text-center">Loading...</p>;
  if (error) return <p className="py-10 text-center text-red-500">{error}</p>;

  return (
    <div className="relative overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-md dark:border-gray-700 dark:bg-gray-900 p-4">
      <Table>
        <TableCaption className="text-lg font-semibold pb-2">
          Exam Results Summary
        </TableCaption>
        <TableHeader className="sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
          <TableRow>
            {[
              { label: "Student", key: "fullName" },
              { label: "Roll No.", key: "rollNumber" },
              { label: "Email", key: "email" },
            ].map(({ label, key }) => (
              <TableHead
                key={key}
                onClick={() => toggleSort(key)}
                className="cursor-pointer select-none whitespace-nowrap font-semibold"
              >
                <div className="flex items-center">
                  {label}
                  {getSortIcon(key)}
                </div>
              </TableHead>
            ))}
            {entries.map((e) => (
              <TableHead
                key={e.subjectId}
                onClick={() => toggleSort(`subject-${e.subjectId}`)}
                className="cursor-pointer select-none whitespace-nowrap font-semibold"
              >
                <div className="flex flex-col">
                  <div className="flex items-center">
                    {e.subject.name}
                    {getSortIcon(`subject-${e.subjectId}`)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Max: {e.maxMarks}, Min: {e.minMarks}
                  </span>
                </div>
              </TableHead>
            ))}
            <TableHead
              onClick={() => toggleSort("total")}
              className="cursor-pointer select-none whitespace-nowrap font-semibold"
            >
              <div className="flex flex-col">
                <div className="flex items-center">
                  Total
                  {getSortIcon("total")}
                </div>
              </div>
            </TableHead>
            <TableHead
              onClick={() => toggleSort("rank")}
              className="cursor-pointer select-none whitespace-nowrap font-semibold text-center"
            >
              <div className="flex items-center justify-center">
                Rank {getSortIcon("rank")}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sortedRows.map((row, idx) => (
            <TableRow
              key={row.student.id}
              className={`transition-all ${
                idx % 2 === 0
                  ? "bg-white dark:bg-gray-800/40"
                  : "bg-white dark:bg-gray-900"
              } hover:bg-emerald-50 dark:hover:bg-blue-900/20`}
            >
              <TableCell className="font-medium">
                {row.student.fullName}
              </TableCell>
              <TableCell>{row.student.rollNumber}</TableCell>
              <TableCell>{row.student.email}</TableCell>
              {entries.map((e) => {
                const m = row.marks[e.subjectId];
                const isLow = typeof m === "number" && m < e.minMarks;
                return (
                  <TableCell
                    key={e.subjectId}
                    className={isLow ? "text-red-600 font-semibold" : ""}
                  >
                    {typeof m === "number" ? m : "-"}
                  </TableCell>
                );
              })}
              <TableCell
                className={`font-semibold ${
                  row.hasFailed
                    ? "text-red-600"
                    : "text-green-700 dark:text-green-400"
                }`}
              >
                {row.total}
              </TableCell>
              <TableCell className="text-center font-bold">
                {row.rank === 1 && (
                  <span className=" text-xl text-yellow-500">1</span>
                )}
                {row.rank === 2 && (
                  <span className=" text-xl text-gray-400">2</span>
                )}
                {row.rank === 3 && (
                  <span className=" text-xl text-amber-800">3</span>
                )}
                {row.rank && row.rank > 3
                  ? row.rank
                  : row.rank === null
                    ? "-"
                    : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
