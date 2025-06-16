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
        const res = await axios.get("http://localhost:5555/api/exams");
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
    async function load() {
      setLoading(true);
      try {
        const [groupRes, marksRes, examsRes] = await Promise.all([
          axios.get(
            `http://localhost:5555/api/school/${schoolId}/group/${groupId}/member`,
          ),
          axios.get(`http://localhost:5555/api/exam-marks/${selectedExamId}`),
          axios.get(`http://localhost:5555/api/exams/${selectedExamId}`),
        ]);

        const members: Student[] = Array.isArray(groupRes.data)
          ? groupRes.data
          : (groupRes.data.members ?? []);

        const marks: ExamMark[] = marksRes.data.data ?? [];
        const examEntries: ExamEntry[] = examsRes.data.entries ?? [];

        const memberIds = new Set(members.map((m) => m.id));
        const filteredMarks = marks.filter((m) => memberIds.has(m.student.id));

        // 🧠 Handle edge cases
        if (!examEntries.length || !marks.length || !filteredMarks.length) {
          setStudentRows([]);
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
        setError("");
      } catch (e: any) {
        console.error(e);
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          setStudentRows([]);
          setError(""); // no error, just empty result
        } else {
          setError(e.response?.data?.message || "Failed to load data");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [selectedExamId, schoolId, groupId]);

  if (loading) return <p className="py-10 text-center">Loading...</p>;
  if (error) return <p className="py-10 text-center text-red-500">{error}</p>;
  if (!studentRows.length) {
    return (
      <p className="py-10 text-center text-gray-500">
        📄 Result not yet released
      </p>
    );
  }

  const top3 = studentRows.slice(0, 3);
  const others = studentRows.slice(3);
  const podium = [top3[1], top3[0], top3[2]];

  return (
    <div className="p-6 bg-white text-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-4">🏆 Leaderboard</h2>

      <div className="flex justify-center mb-16">
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

      {/* 🥇 Podium */}
      <div className="flex justify-center items-end mb-10 gap-6 relative h-64">
        {podium.map(
          (entry, index) =>
            entry && (
              <div
                key={entry.student.id}
                className={`flex flex-col items-center ${
                  index === 1 ? "pb-16 w-32" : "w-28"
                }`}
              >
                <div
                  className={`flex items-center gap-1 text-base font-bold ${
                    index === 0
                      ? "text-gray-500"
                      : index === 1
                        ? "text-yellow-500"
                        : "text-amber-800"
                  } mb-2`}
                >
                  <Trophy className="w-20 h-20" />
                </div>
                <img
                  src={
                    entry.student.avatarUrl ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${entry.student.fullName}`
                  }
                  alt={entry.student.fullName}
                  className={`rounded-full border-4 shadow ${
                    index === 0
                      ? "w-16 h-16 border-gray-500"
                      : index === 1
                        ? "w-20 h-20 border-yellow-400"
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
            ),
        )}
      </div>

      {/* Table for others */}
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
