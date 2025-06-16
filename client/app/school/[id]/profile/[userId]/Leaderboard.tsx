/* eslint-disable @next/next/no-img-element */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  examId: number;
  schoolId: string;
  groupId: string;
  onChangeExam: () => void; // Pass a function to trigger exam change
}

interface Student {
  id: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
}

interface ExamMark {
  id: number;
  marks: number;
  student: Student;
  subjectId: number;
}

interface ExamEntry {
  subjectId: number;
  maxMarks: number;
  minMarks: number;
}

interface StudentRow {
  student: Student;
  total: number;
  hasFailed: boolean;
  rank: number | null;
}

export default function ExamLeaderboard({
  examId,
  schoolId,
  groupId,
  onChangeExam,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [, setEntries] = useState<ExamEntry[]>([]);

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

        const members: Student[] = Array.isArray(groupRes.data)
          ? groupRes.data
          : (groupRes.data.members ?? []);

        const marks: ExamMark[] = marksRes.data.data ?? [];
        const examEntries: ExamEntry[] = entriesRes.data.entries ?? [];

        setEntries(examEntries);

        const memberIds = new Set(members.map((m) => m.id));
        const filteredMarks = marks.filter((m) => memberIds.has(m.student.id));

        const studentMap = new Map<number, StudentRow>();

        filteredMarks.forEach((m) => {
          const sid = m.student.id;
          if (!studentMap.has(sid)) {
            studentMap.set(sid, {
              student: m.student,
              total: 0,
              hasFailed: false,
              rank: null,
            });
          }
          const row = studentMap.get(sid)!;
          row.total += m.marks;
        });

        const rows = Array.from(studentMap.values()).map((row) => {
          let hasFailed = false;

          for (const e of examEntries) {
            const mark = filteredMarks.find(
              (m) =>
                m.student.id === row.student.id && m.subjectId === e.subjectId,
            )?.marks;

            if (typeof mark !== "number" || mark < e.minMarks) {
              hasFailed = true;
            }
          }

          return { ...row, hasFailed };
        });

        // Rank assignment
        let rank = 1;
        let lastTotal: number | null = null;
        let lastRank = 1;

        const sortedRows = rows
          .filter((r) => !r.hasFailed)
          .sort((a, b) => b.total - a.total)
          .map((row) => {
            const sameTotal = row.total === lastTotal;
            const assignedRank = sameTotal ? lastRank : rank;
            lastTotal = row.total;
            lastRank = assignedRank;
            rank++;
            return { ...row, rank: assignedRank };
          });

        const failedRows = rows
          .filter((r) => r.hasFailed)
          .map((r) => ({ ...r, rank: null }));

        setStudentRows([...sortedRows, ...failedRows]);
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Exam Leaderboard</h2>
        <button
          onClick={onChangeExam}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Change Exam
        </button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Avatar</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Total Marks</th>
              <th className="p-3 border">Rank</th>
            </tr>
          </thead>
          <tbody>
            {studentRows.map((row) => (
              <tr key={row.student.id} className="border-t hover:bg-gray-50">
                <td className="p-3 border">
                  {row.student.avatarUrl ? (
                    <img
                      src={row.student.avatarUrl}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                      ?
                    </div>
                  )}
                </td>
                <td className="p-3 border font-medium">
                  {row.student.fullName}
                </td>
                <td
                  className={`p-3 border ${row.hasFailed ? "text-red-500 font-semibold" : ""}`}
                >
                  {row.total}
                </td>
                <td className="p-3 border font-bold">{row.rank ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
