/* eslint-disable @next/next/no-img-element */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trophy } from "lucide-react";
import { useParams } from "next/navigation";

interface Props {
  examId: number;
  schoolId: string;
  groupId: string;
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

interface Exam {
  id: number;
  name: string;
  groupId: number;
  entries: ExamEntry[];
}

export default function Leaderboard({
  examId: initialExamId,
  schoolId,
  groupId,
}: Props) {
  const params = useParams();
  const currentUserId = Number(params?.userId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [examList, setExamList] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId);

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await axios.get(
          "${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams",
        );
        const filtered = (res.data ?? []).filter(
          (exam: Exam) => String(exam.groupId) === groupId,
        );
        setExamList(filtered);
      } catch (e) {
        console.error("Failed to fetch exams", e);
        setExamList([]);
      }
    }
    fetchExams();
  }, [groupId]);

  useEffect(() => {
    if (!selectedExamId) return;

    async function loadLeaderboard() {
      setLoading(true);
      setError(""); // reset error
      try {
        const [groupRes, marksRes, examRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/school/${schoolId}/group/${groupId}/member`,
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exam-marks/${selectedExamId}`,
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/${selectedExamId}`,
          ),
        ]);

        const members: Student[] = Array.isArray(groupRes.data)
          ? groupRes.data
          : (groupRes.data.members ?? []);

        const marks: ExamMark[] = marksRes.data?.data ?? [];
        const examEntries: ExamEntry[] = examRes.data?.entries ?? [];

        const memberIds = new Set(members.map((m) => m.id));
        const filteredMarks = marks.filter((m) => memberIds.has(m.student.id));

        // ⚠️ No entries or no marks means we skip ranking
        if (!examEntries.length || !filteredMarks.length) {
          setStudentRows([]);
          setError("📄 No marks available for this exam yet.");
          setLoading(false);
          return;
        }

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
          for (const entry of examEntries) {
            const mark = marks.find(
              (m) =>
                m.student.id === row.student.id &&
                m.subjectId === entry.subjectId,
            );
            if (!mark || mark.marks < entry.minMarks) {
              hasFailed = true;
              break;
            }
          }
          return { ...row, hasFailed };
        });

        const passed = rows
          .filter((r) => !r.hasFailed)
          .sort((a, b) => b.total - a.total);

        let rank = 1;
        let lastTotal: number | null = null;
        let lastRank = 1;

        const ranked = passed.map((row) => {
          const sameTotal = row.total === lastTotal;
          const assignedRank = sameTotal ? lastRank : rank;
          lastTotal = row.total;
          lastRank = assignedRank;
          rank++;
          return { ...row, rank: assignedRank };
        });

        setStudentRows(ranked);
      } catch (e: any) {
        console.error(e);
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          setStudentRows([]);
          setError("📄 No marks found for the selected exam.");
        } else {
          setError(e.response?.data?.message || "❌ Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    }

    loadLeaderboard();
  }, [selectedExamId, schoolId, groupId]);

  const top3 = studentRows.slice(0, 3);
  const others = studentRows.slice(3);
  const podium = [top3[1], top3[0], top3[2]];

  if (loading) return <p className="py-10 text-center">Loading...</p>;
  if (error) return <p className="py-10 text-center text-red-500">{error}</p>;
  if (!studentRows.length)
    return (
      <p className="py-10 text-center text-gray-500">
        📄 Result not yet released
      </p>
    );

  return (
    <div className="p-6 bg-white text-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-6">🏆 Leaderboard</h2>

      <div className="flex justify-center mb-12">
        <select
          className="border border-gray-300 rounded px-4 py-2"
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(Number(e.target.value))}
        >
          {examList.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.name}
            </option>
          ))}
        </select>
      </div>

      {/* Podium View */}
      <div className="flex justify-center items-end mb-12 gap-6 relative h-64">
        {podium.map((entry, index) =>
          entry ? (
            <div
              key={entry.student.id}
              className={`flex flex-col items-center ${
                index === 1 ? "pb-16 w-32" : "w-28"
              }`}
            >
              <Trophy
                className={`w-20 h-20 ${
                  index === 1
                    ? "text-yellow-500"
                    : index === 0
                      ? "text-gray-500"
                      : "text-amber-800"
                } mb-2`}
              />
              <img
                src={
                  entry.student.avatarUrl ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${entry.student.fullName}`
                }
                alt={entry.student.fullName}
                className={`rounded-full border-4 shadow ${
                  index === 1
                    ? "w-20 h-20 border-yellow-400"
                    : index === 0
                      ? "w-16 h-16 border-gray-500"
                      : "w-16 h-16 border-amber-800"
                }`}
              />
              <div className="text-center mt-2 font-medium text-sm">
                {entry.student.fullName}
              </div>
              <div className="text-xs text-gray-500">
                {entry.total.toFixed(2)} Marks
              </div>
            </div>
          ) : (
            <div key={index} className="w-28" />
          ),
        )}
      </div>

      {/* Table of other students */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm rounded shadow border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Rank</th>
              <th className="p-3">Student</th>
              <th className="p-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {others.map((row) => {
              const isCurrent = row.student.id === currentUserId;
              return (
                <tr
                  key={row.student.id}
                  className={`border-b ${
                    isCurrent
                      ? "bg-yellow-100 font-semibold text-yellow-900"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="p-3">#{row.rank}</td>
                  <td className="p-3">{row.student.fullName}</td>
                  <td className="p-3">{row.total.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
