"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useEffect, useState } from "react";

type ExamMark = {
  id: number;
  marks: number;
  createdAt: string;
  subject: {
    id: number;
    name: string;
  };
  student: {
    id: number;
    fullName: string;
    email: string;
  };
  examEntry: {
    date: string;
    session: string;
    time: string;
    maxMarks: number;
    minMarks: number;
    exam: {
      id: number;
      name: string;
      batch: string;
      groupId: number;
    };
  };
};

type ExamEntry = {
  id: number;
  subjectId: number;
  maxMarks: number;
  minMarks: number;
  subject: {
    id: number;
    name: string;
  };
};

type Exam = {
  id: number;
  name: string;
  batch: string;
  groupId: number;
  data: ExamMark[];
  entries?: ExamEntry[];
};

type ChartData = {
  activity: string;
  value: number;
  fullMark: number;
};

type Props = {
  user: {
    id: number;
    fullName: string;
    email: string;
  };
};

export default function ExamRadarChart({ user }: Props) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/user/${user.id}`,
        );
        if (!res.ok) throw new Error("Failed to fetch exam marks");
        const result = await res.json();
        const examList: Exam[] = result.exams || [];

        const updatedExams = await Promise.all(
          examList.map(async (exam) => {
            const res2 = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams/${exam.id}`,
            );
            const details = await res2.json();
            return { ...exam, entries: details.entries || [] };
          }),
        );

        setExams(updatedExams);
        if (updatedExams.length > 0) setSelectedExamId(updatedExams[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user.id]);

  const selectedExam = exams.find((e) => e.id === selectedExamId);

  const chartData: ChartData[] =
    selectedExam?.data?.map((mark) => {
      const entry = selectedExam.entries?.find(
        (e) => e.subjectId === mark.subject.id,
      );

      return {
        activity: mark.subject.name,
        value: mark.marks,
        fullMark: entry?.maxMarks ?? mark.examEntry.maxMarks,
      };
    }) || [];

  const totalObtained =
    selectedExam?.data?.reduce((sum, mark) => sum + mark.marks, 0) || 0;

  const totalMax =
    selectedExam?.data?.reduce((sum, mark) => {
      const entry = selectedExam.entries?.find(
        (e) => e.subjectId === mark.subject.id,
      );
      return sum + (entry?.maxMarks ?? mark.examEntry.maxMarks);
    }, 0) || 0;

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-center text-2xl font-bold text-gray-800">
        Exam Marks Overview
      </h2>

      {/* Exam Selector */}
      <div className="flex justify-center">
        <Select
          value={selectedExamId?.toString() ?? ""}
          onValueChange={(value) => setSelectedExamId(Number(value))}
        >
          <SelectTrigger className="w-64 border px-4 py-2 rounded shadow-sm bg-white">
            <SelectValue placeholder="Select exam" />
          </SelectTrigger>
          <SelectContent>
            {exams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id.toString()}>
                {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Radar Chart */}
      <div className="w-full h-[400px] bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="activity" />
              <PolarRadiusAxis />
              <Tooltip />
              <Legend />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#10b981"
                fill="#6ee7b7"
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
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Exam Mark Details
        </h3>
        {selectedExam?.data?.length === 0 ? (
          <p className="text-gray-500">No marks found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 text-left text-gray-700 font-medium">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Mark</th>
                  <th className="p-3">Max</th>
                  <th className="p-3">Min</th>
                  <th className="p-3">%</th>
                  <th className="p-3">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedExam?.data?.map((mark) => {
                  const entry = selectedExam.entries?.find(
                    (e) => e.subjectId === mark.subject.id,
                  );
                  const max = entry?.maxMarks ?? mark.examEntry.maxMarks;
                  const min = entry?.minMarks ?? mark.examEntry.minMarks;
                  const percentage = max
                    ? ((mark.marks / max) * 100).toFixed(2)
                    : "N/A";
                  const isFail = mark.marks < min;

                  return (
                    <tr key={mark.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        {new Date(mark.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">{mark.subject.name}</td>
                      <td
                        className={`p-3 ${isFail ? "text-red-500 font-semibold" : ""}`}
                      >
                        {mark.marks}
                      </td>
                      <td className="p-3">{max}</td>
                      <td className="p-3">{min}</td>
                      <td className="p-3">
                        {percentage !== "N/A" ? `${percentage}%` : "N/A"}
                      </td>
                      <td
                        className={`p-3 ${isFail ? "text-red-600 font-semibold" : "text-green-600"}`}
                      >
                        {isFail ? "Fail" : "Pass"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Total Section */}
            <div className="mt-4 text-right text-gray-800 font-medium">
              <p>
                Total Marks: {totalObtained} / {totalMax}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
