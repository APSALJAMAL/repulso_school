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

        // Filter marks for current user only
        const userMarks = data.filter((mark) => mark.student.id === user.id);

        setMarks(userMarks);

        if (userMarks.length > 0) {
          const subjects = [
            ...new Set(userMarks.map((m: Mark) => m.row.subject.name)),
          ];
          setSelectedSubject(subjects[0]);
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unknown error occurred");
        }
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

  const chartData: ChartData[] = filteredMarks.map((mark) => ({
    activity: mark.row.name,
    value: mark.value,
    fullMark: mark.row.max,
  }));

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6">
      <h2 className="mb-4 text-center text-xl font-bold">Marks Overview</h2>

      {/* Dropdown */}
      <div className="mb-6 flex justify-center">
        <Select
          value={selectedSubject}
          onValueChange={(value) => setSelectedSubject(value)}
        >
          <SelectTrigger className="text-foreground border-border w-auto px-2">
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

      {/* Layout: Chart on left, Table on right */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Radar Chart */}
        <div className="bg-white p-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="activity" />
                <PolarRadiusAxis />
                <Radar
                  name="Mark"
                  dataKey="value"
                  stroke="#22c55e"
                  fill="#4ade80"
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

        {/* Mark Table */}
        <div className="bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Student Marks
          </h2>
          {filteredMarks.length === 0 ? (
            <div className="text-gray-500">No marks found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-800">
                <thead className="bg-gray-100 font-semibold text-gray-700">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Activity</th>
                    <th className="p-3">Mark</th>
                    <th className="p-3">Maximum</th>
                    <th className="p-3">Percentage</th>
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
                        <td className="p-3">
                          {mark.row?.subject?.name || "N/A"}
                        </td>
                        <td className="p-3">{mark.row?.name || "N/A"}</td>
                        <td className="p-3">{mark.value}</td>
                        <td className="p-3">{mark.row?.max}</td>
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
    </div>
  );
}
