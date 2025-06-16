"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Subject {
  id: number;
  name: string;
  imageUrl: string | null;
}

interface Entry {
  id: number;
  subjectId: number;
  examId: number;
  date: string;
  session: string;
  time: string;
  maxMarks: number;
  minMarks: number;
  subject: Subject;
}

interface Group {
  id: number;
  name: string;
}

interface Exam {
  id: number;
  name: string;
  batch: string;
  group: Group;
  entries: Entry[];
}

interface ExamTimetableProps {
  exams: Exam[];
}

export default function ExamTimetable({ exams }: ExamTimetableProps) {
  const [selectedExamId, setSelectedExamId] = useState<number>(exams[0].id);
  const selectedExam = exams.find((e) => e.id === selectedExamId)!;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 border rounded-xl shadow-lg bg-white dark:bg-gray-900 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            Exam Timetable
          </h2>
          <p className="text-gray-500 mt-1">
            <strong>{selectedExam.name}</strong> – {selectedExam.batch} (
            {selectedExam.group.name})
          </p>
        </div>

        {/* Dropdown for selecting exam */}
        <div className="w-full md:w-72">
          <Select
            value={String(selectedExamId)}
            onValueChange={(val) => setSelectedExamId(Number(val))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={String(exam.id)}>
                  {exam.name} – {exam.batch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-center">Max Marks</TableHead>
              <TableHead className="text-center">Min Marks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedExam.entries.map((entry) => {
              const date = new Date(entry.date);
              return (
                <TableRow key={entry.id}>
                  <TableCell>{format(date, "dd-MM-yyyy")}</TableCell>
                  <TableCell>{format(date, "EEEE")}</TableCell>
                  <TableCell>{entry.session}</TableCell>
                  <TableCell>{entry.time}</TableCell>
                  <TableCell>{entry.subject.name}</TableCell>
                  <TableCell className="text-center">
                    {entry.maxMarks}
                  </TableCell>
                  <TableCell className="text-center">
                    {entry.minMarks}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
