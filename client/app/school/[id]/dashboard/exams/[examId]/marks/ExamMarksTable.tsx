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
}

interface Student {
  id: number;
  fullName: string;
  email: string;
}

interface Subject {
  id: number;
  name: string;
}

interface ExamMark {
  id: number;
  marks: number;
  student: Student;
  subject: Subject;
}

interface StudentRow {
  student: Student;
  marks: { [subjectName: string]: number };
  total: number;
}

const ExamMarksTable: React.FC<Props> = ({ examId }) => {
  const [studentRows, setStudentRows] = useState<StudentRow[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5555/api/exam-marks/${examId}`,
        );
        const marks: ExamMark[] = res.data.data;

        // 1. Extract unique subjects
        const subjectSet = new Set(marks.map((m) => m.subject.name));
        const allSubjects = Array.from(subjectSet);

        // 2. Group by student
        const studentMap = new Map<number, StudentRow>();

        marks.forEach((mark) => {
          const studentId = mark.student.id;
          if (!studentMap.has(studentId)) {
            studentMap.set(studentId, {
              student: mark.student,
              marks: {},
              total: 0,
            });
          }
          const studentRow = studentMap.get(studentId)!;
          studentRow.marks[mark.subject.name] = mark.marks;
          studentRow.total += mark.marks;
        });

        // 3. Convert to array and sort by total to calculate rank
        const sortedStudents = Array.from(studentMap.values()).sort(
          (a, b) => b.total - a.total,
        );

        setSubjects(allSubjects);
        setStudentRows(sortedStudents);
      } catch (err) {
        console.error(err);
        setError("Failed to load marks");
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [examId]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="p-4">
      <Table>
        <TableCaption>Exam results with total & rank</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Email</TableHead>
            {subjects.map((sub) => (
              <TableHead key={sub}>{sub}</TableHead>
            ))}
            <TableHead>Total</TableHead>
            <TableHead>Rank</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentRows.map((row, index) => (
            <TableRow key={row.student.id}>
              <TableCell>{row.student.fullName}</TableCell>
              <TableCell>{row.student.email}</TableCell>
              {subjects.map((sub) => (
                <TableCell key={sub}>
                  {row.marks[sub] !== undefined ? row.marks[sub] : "-"}
                </TableCell>
              ))}
              <TableCell className="font-semibold">{row.total}</TableCell>
              <TableCell className="font-bold">{index + 1}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ExamMarksTable;
