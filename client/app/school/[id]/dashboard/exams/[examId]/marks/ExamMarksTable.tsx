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
  const [totalMax, setTotalMax] = useState(0);
  const [totalMin, setTotalMin] = useState(0);

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

        const members: Student[] = (
          Array.isArray(groupRes.data)
            ? groupRes.data
            : (groupRes.data.members ?? [])
        ).map((m: any) => ({
          id: m.id,
          fullName: m.fullName,
          email: m.email,
          rollNumber: m.rollNumber || "N/A",
        }));

        const marks: ExamMark[] = marksRes.data.data ?? [];
        const examEntries: ExamEntry[] = entriesRes.data.entries ?? [];

        setEntries(examEntries);
        setTotalMax(examEntries.reduce((sum, e) => sum + e.maxMarks, 0));
        setTotalMin(examEntries.reduce((sum, e) => sum + (e.minMarks ?? 0), 0));

        const memberIds = new Set(members.map((m) => m.id));
        const filteredMarks = marks.filter((m) => memberIds.has(m.student.id));

        const studentMap = new Map<number, StudentRow>();

        filteredMarks.forEach((m) => {
          const sid = m.student.id;
          if (!studentMap.has(sid)) {
            const matched = members.find((mem) => mem.id === sid);
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
              if (mark < e.minMarks) {
                hasFailed = true;
              }
            } else {
              hasFailed = true;
            }
          }

          return { ...row, total, hasFailed };
        });

        const passed = rows.filter((r) => !r.hasFailed);
        passed.sort((a, b) => b.total - a.total);

        let rank = 1;
        let lastTotal = -1;
        let lastRank = 1;

        for (let i = 0; i < passed.length; i++) {
          const student = passed[i];
          if (student.total === lastTotal) {
            student.rank = lastRank;
          } else {
            student.rank = rank;
            lastRank = rank;
          }
          lastTotal = student.total;
          rank++;
        }

        const finalRows = rows.map((r) => {
          const found = passed.find((p) => p.student.id === r.student.id);
          return found ?? r;
        });

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

  if (loading) return <p className="py-10 text-center">Loading...</p>;
  if (error) return <p className="py-10 text-center text-red-500">{error}</p>;

  return (
    <div className="p-4 overflow-auto bg-white rounded-lg shadow">
      <Table>
        <TableCaption className="text-lg font-semibold pb-2">
          Exam Results Summary
        </TableCaption>
        <TableHeader className="bg-gray-100 dark:bg-gray-800">
          <TableRow>
            <TableHead className="font-semibold">Student</TableHead>
            <TableHead>Roll Number</TableHead>
            <TableHead>Email</TableHead>
            {entries.map((e) => (
              <TableHead key={e.subjectId}>
                {e.subject.name}
                <div className="text-xs text-muted-foreground">
                  (Max: {e.maxMarks}, Min: {e.minMarks})
                </div>
              </TableHead>
            ))}
            <TableHead>
              Total
              <div className="text-xs text-muted-foreground">
                Max: {totalMax}
                <br />
                Min: {totalMin}
              </div>
            </TableHead>
            <TableHead>Rank</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {studentRows.map((row, idx) => (
            <TableRow
              key={row.student.id}
              className={idx % 2 === 0 ? "bg-gray-50" : ""}
            >
              <TableCell className="font-medium">
                {row.student.fullName}
              </TableCell>
              <TableCell className="font-medium">
                {row.student.rollNumber || "N/A"}
              </TableCell>
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
                className={
                  row.hasFailed ? "text-red-600 font-semibold" : "font-semibold"
                }
              >
                {row.total}
              </TableCell>
              <TableCell className="font-bold text-center">
                {row.rank ?? "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
