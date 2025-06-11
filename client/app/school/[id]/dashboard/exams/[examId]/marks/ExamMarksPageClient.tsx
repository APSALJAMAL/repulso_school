"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import { getCookie } from "cookies-next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Student {
  id: number;
  fullName: string;
  email: string;
}

interface Subject {
  id: number;
  name: string;
}

interface MarkEntry {
  [subjectId: number]: number;
}

interface StudentMarks {
  studentId: number;
  marks: MarkEntry;
}

interface Props {
  examId: string;
  schoolId: string;
  groupId: string;
}

export default function ExamMarksPageClient({
  examId,
  schoolId,
  groupId,
}: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [marks, setMarks] = useState<StudentMarks[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const getAuthHeaders = () => {
    const token = getCookie("token");
    return token ? { Authorization: `${token}` } : {};
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [memberRes, subjectRes] = await Promise.all([
          axios.get(`/school/${schoolId}/group/${groupId}/member`, {
            headers: getAuthHeaders(),
          }),
          axios.get(`/school/${schoolId}/subject`, {
            headers: getAuthHeaders(),
          }),
        ]);

        const members: Student[] = Array.isArray(memberRes.data)
          ? memberRes.data
          : (memberRes.data.members ?? []);

        const subjectList: Subject[] = Array.isArray(subjectRes.data)
          ? subjectRes.data
          : (subjectRes.data.subjects ?? []);

        const initialMarks: StudentMarks[] = members.map((student) => ({
          studentId: student.id,
          marks: subjectList.reduce((acc, subject) => {
            acc[subject.id] = 0;
            return acc;
          }, {} as MarkEntry),
        }));

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
  }, [schoolId, groupId]);

  const handleMarkChange = (
    studentId: number,
    subjectId: number,
    value: string,
  ) => {
    const parsed = parseFloat(value);
    setMarks((prev) =>
      prev.map((entry) =>
        entry.studentId === studentId
          ? {
              ...entry,
              marks: {
                ...entry.marks,
                [subjectId]: isNaN(parsed) ? 0 : parsed,
              },
            }
          : entry,
      ),
    );
  };

  const handleSave = async (studentId: number) => {
    const studentMarks = marks.find((m) => m.studentId === studentId);
    if (!studentMarks) return;

    setSavingId(studentId);
    try {
      await Promise.all(
        Object.entries(studentMarks.marks).map(([subjectId, mark]) =>
          axios.post(
            "/exam-marks",
            {
              examEntryId: parseInt(examId),
              studentId,
              subjectId: parseInt(subjectId),
              marks: mark,
            },
            {
              headers: getAuthHeaders(),
            },
          ),
        ),
      );
      alert("✅ Marks saved successfully.");
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("❌ Failed to save marks.");
    } finally {
      setSavingId(null);
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
      <CardHeader>
        <CardTitle className="text-2xl">Enter Exam Marks</CardTitle>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <p className="text-gray-500">No subjects found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                {subjects.map((subject) => (
                  <TableHead key={subject.id}>{subject.name}</TableHead>
                ))}
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const studentMarkEntry = marks.find(
                  (m) => m.studentId === student.id,
                );

                return (
                  <TableRow key={student.id}>
                    <TableCell>{student.fullName}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    {subjects.map((subject) => (
                      <TableCell key={subject.id}>
                        <Input
                          type="number"
                          className="w-20"
                          value={
                            studentMarkEntry?.marks[subject.id]?.toString() ??
                            ""
                          }
                          onChange={(e) =>
                            handleMarkChange(
                              student.id,
                              subject.id,
                              e.target.value,
                            )
                          }
                        />
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <Button
                        onClick={() => handleSave(student.id)}
                        disabled={savingId === student.id}
                      >
                        {savingId === student.id ? "Saving..." : "Save"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
