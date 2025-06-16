"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
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

type Mark = {
  id: number;
  value: number;
  tableRowId: number;
  createdAt: string;
  student: {
    id: number;
    fullName: string;
    email: string;
  };
  row: {
    id: number;
    name: string;
    max: number;
    subject: {
      name: string;
    };
  };
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

export default function MarkRadarAndTable({ user }: Props) {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const res = await fetch("http://localhost:5555/api/marks");
        if (!res.ok) throw new Error("Failed to fetch marks");
        const data: Mark[] = await res.json();

        const userMarks = data.filter((mark) => mark.student.id === user.id);
        setMarks(userMarks);

        if (userMarks.length > 0) {
          const subjects = [
            ...new Set(userMarks.map((m) => m.row.subject.name)),
          ];
          setSelectedSubject(subjects[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [user.id]);

  const subjects = [...new Set(marks.map((mark) => mark.row.subject.name))];
  const filteredMarks = marks.filter(
    (mark) => mark.row.subject.name === selectedSubject,
  );

  // Group by activity name and average values if duplicates exist
  const aggregatedMap = new Map<
    string,
    { total: number; count: number; fullMark: number }
  >();

  filteredMarks.forEach((mark) => {
    const key = mark.row.name;
    const existing = aggregatedMap.get(key);
    if (existing) {
      aggregatedMap.set(key, {
        total: existing.total + mark.value,
        count: existing.count + 1,
        fullMark: Math.max(existing.fullMark, mark.row.max),
      });
    } else {
      aggregatedMap.set(key, {
        total: mark.value,
        count: 1,
        fullMark: mark.row.max,
      });
    }
  });

  const chartData: ChartData[] = Array.from(aggregatedMap.entries()).map(
    ([activity, { total, count, fullMark }]) => ({
      activity,
      value: Number((total / count).toFixed(2)),
      fullMark,
    }),
  );

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-center text-2xl font-bold text-gray-800">
        Subjects Marks Overview
      </h2>

      {/* Subject Dropdown */}
      <div className="flex justify-center">
        <Select
          value={selectedSubject}
          onValueChange={(value) => setSelectedSubject(value)}
        >
          <SelectTrigger className="w-64 border px-4 py-2 rounded shadow-sm bg-white">
            <SelectValue placeholder="Select subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
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
              <PolarRadiusAxis angle={30} />
              <Tooltip />
              <Legend />
              <Radar
                name="Score"
                dataKey="value"
                stroke="#10b981" // Tailwind green-500
                fill="#6ee7b7" // Tailwind green-300
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-gray-500">
            No data for this subject.
          </div>
        )}
      </div>

      {/* Marks Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Student Marks
        </h3>
        {filteredMarks.length === 0 ? (
          <p className="text-gray-500">No marks found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 text-left text-gray-700 font-medium">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Activity</th>
                  <th className="p-3">Mark</th>
                  <th className="p-3">Max</th>
                  <th className="p-3">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMarks.map((mark) => {
                  const percentage = mark.row?.max
                    ? ((mark.value / mark.row.max) * 100).toFixed(2)
                    : "N/A";

                  return (
                    <tr key={mark.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        {new Date(mark.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">{mark.row.subject.name}</td>
                      <td className="p-3">{mark.row.name}</td>
                      <td className="p-3">{mark.value}</td>
                      <td className="p-3">{mark.row.max}</td>
                      <td className="p-3">
                        {percentage !== "N/A" ? `${percentage}%` : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
