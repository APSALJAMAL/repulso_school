/* eslint-disable prettier/prettier */
"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

type Mark = {
  id: number;
  marks: number;
  createdAt: string;
  student: {
    id: number;
    fullName: string;
    email: string;
  };
  subject: {
    id: number;
    name: string;
  };
  examEntry: {
    date: string;
    session: string;
    time: string;
    exam: {
      id: number;
      name: string;
      maxMarks: number;
      minMarks: number;
    };
  };
};

type ChartData = {
  activity: string;
  value: number;
  fullMark: number;
};

type ExamMeta = {
  id: number;
  name: string;
  batch: string;
  groupId: number;
  maxMarks: number;
  minMarks: number;
};

type Props = {
  examId: string;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
};

export default function MarkRadarForExam({ examId, user }: Props) {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [examMeta, setExamMeta] = useState<ExamMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5555/api/exams/user/${user.id}`);
        if (!res.ok) throw new Error("Failed to fetch exam marks");

        const result = await res.json();
        const allExams: ExamMeta[] = result.exams;

        // Get current exam meta
        const currentExam = allExams.find((exam) => exam.id === Number(examId));
        setExamMeta(currentExam ?? null);

        // Fetch full mark entries (optional if API already returns them)
        const fullRes = await fetch(`http://localhost:5555/api/marks/exam/${examId}`);
        if (!fullRes.ok) throw new Error("Failed to fetch full mark entries");

        const marksData: Mark[] = (await fullRes.json()).data;

        const userMarks = marksData.filter((mark) => mark.student.id === user.id);
        setMarks(userMarks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [examId, user.id]);

  const chartData: ChartData[] = marks.map((mark) => ({
    value: mark.marks,
    activity: mark.subject.name,
    fullMark: mark.examEntry.exam?.maxMarks ?? examMeta?.maxMarks ?? 100,
  }));

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-center text-xl font-bold">
        Marks Overview for Exam - {examMeta?.name}
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Radar Chart */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="activity" />
                <PolarRadiusAxis />
                <Radar
                  name="Marks"
                  dataKey="value"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500">
              No data for this exam.
            </div>
          )}
        </div>

        {/* Mark Table */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Exam Mark Details
          </h2>
          {marks.length === 0 ? (
            <div className="text-gray-500">No marks found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-800">
                <thead className="bg-gray-100 font-semibold text-gray-700">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Mark</th>
                    <th className="p-3">Max</th>
                    <th className="p-3">Min</th>
                    <th className="p-3">Percentage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {marks.map((mark) => {
                    const max = mark.examEntry.exam?.maxMarks ?? examMeta?.maxMarks ?? 0;
                    const min = mark.examEntry.exam?.minMarks ?? examMeta?.minMarks ?? 0;
                    const percentage = max
                      ? ((mark.marks / max) * 100).toFixed(2)
                      : "N/A";
                    return (
                      <tr key={mark.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          {new Date(mark.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">{mark.subject?.name || "N/A"}</td>
                        <td className="p-3">{mark.marks}</td>
                        <td className="p-3">{max}</td>
                        <td className="p-3">{min}</td>
                        <td className="p-3">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
