/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import { getCookie } from "cookies-next";
import { Card, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface Student {
  id: number;
  fullName: string;
  email: string;
}

interface SubjectEntry {
  subjectId: number;
  subject: { id: number; name: string };
  maxMarks: number;
  minMarks: number;
}

interface MarkEntry {
  [subjectId: number]: number | string; // Now includes string for editable state
}

interface StudentMarks {
  studentId: number;
  marks: MarkEntry;
}
interface Exam {
  id: number;
  name: string;
  date: string;
  session: string;
  time: string;
  batch: string | null;
  group: {
    name: string;
  };
}

interface Props {
  examId: string;
  schoolId: string;
  groupId: string;
}

const debounce = (fn: (...args: any[]) => void, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export default function ExamMarksPageClient({
  examId,
  schoolId,
  groupId,
}: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<SubjectEntry[]>([]);
  const [marks, setMarks] = useState<StudentMarks[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [exam, setExam] = useState<Exam | null>(null);

  const getAuthHeaders = () => {
    const token = getCookie("token");
    return token ? { Authorization: `${token}` } : {};
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [memberRes, examRes, marksRes] = await Promise.all([
          axios.get(`/school/${schoolId}/group/${groupId}/member`, {
            headers: getAuthHeaders(),
          }),
          axios.get(`/exams/${examId}`, {
            headers: getAuthHeaders(),
          }),
          axios.get(`/exam-marks/${examId}`, {
            headers: getAuthHeaders(),
          }),
        ]);

        const members: Student[] = Array.isArray(memberRes.data)
          ? memberRes.data
          : (memberRes.data?.members ?? []);

        const subjectList: SubjectEntry[] = examRes.data?.entries ?? [];
        setExam(examRes.data || null);

        const existingMarks = Array.isArray(marksRes.data)
          ? marksRes.data
          : Array.isArray(marksRes.data?.data)
            ? marksRes.data.data
            : [];

        const initialMarks: StudentMarks[] = members.map((student) => {
          const studentMarks = existingMarks.filter(
            (m: any) => m.studentId === student.id,
          );

          const marksMap = subjectList.reduce((acc, subject) => {
            const entry = studentMarks.find(
              (m: any) => m.subjectId === subject.subjectId,
            );
            acc[subject.subjectId] = entry?.marks?.toString() ?? "";
            return acc;
          }, {} as MarkEntry);

          return { studentId: student.id, marks: marksMap };
        });

        setStudents(members);
        setSubjects(subjectList);
        setMarks(initialMarks);
      } catch (err) {
        console.error("❌ Failed to fetch data:", err);
        setError(
          "Failed to load data. Please check your network or credentials.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [schoolId, groupId, examId]);

  const saveMark = async (
    studentId: number,
    subjectId: number,
    mark: number,
  ) => {
    try {
      await axios.post(
        "/exam-marks",
        {
          examEntryId: parseInt(examId),
          studentId,
          subjectId,
          marks: mark,
        },
        {
          headers: getAuthHeaders(),
        },
      );
      console.log(
        `✅ Auto-saved mark for student ${studentId}, subject ${subjectId}`,
      );
    } catch (err) {
      console.error("❌ Auto-save failed:", err);
    }
  };

  const debounceSaveMark = debounce(saveMark, 500);

  const handleMarkChange = (
    studentId: number,
    subjectId: number,
    value: string,
  ) => {
    // Always update the raw string
    setMarks((prev) =>
      prev.map((entry) =>
        entry.studentId === studentId
          ? {
              ...entry,
              marks: {
                ...entry.marks,
                [subjectId]: value,
              },
            }
          : entry,
      ),
    );

    // Save only if value is valid
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      const subject = subjects.find((s) => s.subjectId === subjectId);
      if (!subject) return;

      const mark = Math.min(parsed, subject.maxMarks);
      debounceSaveMark(studentId, subjectId, mark);
    }
  };

  if (loading) {
    return <p className="text-center py-10">Loading data...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-10">{error}</p>;
  }

  return (
    <Card className="max-w-7xl mx-auto p-4">
      <CardContent>
        <div className="mb-4 space-y-1 text-sm text-gray-700">
          <div>
            <strong>Group ID:</strong> {groupId}
          </div>
          <div>
            <strong>Group Name:</strong> {exam?.group.name || "Loading..."}
          </div>
          <div>
            <strong>Exam ID:</strong> {examId}
          </div>
          <div>
            <strong>Exam Name:</strong> {exam?.name || "Loading..."}
          </div>
        </div>
      </CardContent>
      <CardContent>
        <CardTitle className="text-2xl">Enter Exam Marks</CardTitle>
      </CardContent>
      <CardContent>
        {subjects.length === 0 ? (
          <p className="text-gray-500">No subjects found.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  {subjects.map((subject) => (
                    <TableHead key={subject.subjectId}>
                      <div className="flex flex-col">
                        <span>{subject.subject.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Max: {subject.maxMarks} | Min: {subject.minMarks}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead>
                    <div className="flex flex-col">
                      <span>Total</span>
                      <span className="text-xs text-muted-foreground">
                        Max: {subjects.reduce((acc, s) => acc + s.maxMarks, 0)}
                      </span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const studentMarkEntry = marks.find(
                    (m) => m.studentId === student.id,
                  );

                  const total = subjects.reduce((sum, subject) => {
                    const val = studentMarkEntry?.marks[subject.subjectId];
                    const num = typeof val === "string" ? parseFloat(val) : val;
                    return (
                      sum + (typeof num === "number" && !isNaN(num) ? num : 0)
                    );
                  }, 0);

                  return (
                    <TableRow key={student.id}>
                      <TableCell>{student.fullName}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      {subjects.map((subject) => (
                        <TableCell key={subject.subjectId}>
                          <Input
                            type="number"
                            className="w-20"
                            min={0}
                            max={subject.maxMarks}
                            value={
                              studentMarkEntry?.marks[subject.subjectId] ?? ""
                            }
                            onChange={(e) =>
                              handleMarkChange(
                                student.id,
                                subject.subjectId,
                                e.target.value,
                              )
                            }
                          />
                        </TableCell>
                      ))}
                      <TableCell className="font-semibold">{total}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
