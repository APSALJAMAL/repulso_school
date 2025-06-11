"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Timeslot {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface Subject {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  fullName: string;
}

interface Entry {
  id: number;
  subject: Subject;
  teacher: Teacher;
  timeslot: Timeslot;
}

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function TimetablePage() {
  const params = useParams();
  const groupId = params.groupId as string;
  const schoolId = params.id as string;
  const [entries, setEntries] = useState<Entry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [timeslots, setTimeslots] = useState<Timeslot[]>([]);

  const [form, setForm] = useState({
    subjectId: "",
    teacherId: "",
    timeslotId: "",
  });
  const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchData = useCallback(async () => {
    try {
      const [entriesRes, subjectsRes, teachersRes, timeslotsRes] =
        await Promise.all([
          axios.get(`${BASE_URL}/api/timetable/group/${groupId}`),
          axios.get(`${BASE_URL}/api/school/${schoolId}/subject`),
          axios.get(`${BASE_URL}/api/school/${schoolId}/teachers`),
          axios.get(`${BASE_URL}/api/timeslots`),
        ]);

      setEntries(entriesRes.data);
      setSubjects(subjectsRes.data);
      setTeachers(teachersRes.data);
      setTimeslots(timeslotsRes.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to fetch data");
    }
  }, [groupId, schoolId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async () => {
    try {
      await axios.post(`${BASE_URL}/api/timetable`, {
        groupId: parseInt(groupId),
        subjectId: parseInt(form.subjectId),
        teacherId: parseInt(form.teacherId),
        timeslotId: parseInt(form.timeslotId),
      });
      toast.success("Timetable entry created");
      setForm({ subjectId: "", teacherId: "", timeslotId: "" });
      fetchData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Error creating entry");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/timetable/${id}`);
      toast.success("Entry deleted");
      fetchData();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Error deleting entry");
    }
  };

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Timetable Entry</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Subject</Label>
            <Select
              onValueChange={(val) => setForm({ ...form, subjectId: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Teacher</Label>
            <Select
              onValueChange={(val) => setForm({ ...form, teacherId: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Timeslot</Label>
            <Select
              onValueChange={(val) => setForm({ ...form, timeslotId: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Timeslot" />
              </SelectTrigger>
              <SelectContent>
                {timeslots.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {days[t.dayOfWeek]} {t.startTime} - {t.endTime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="col-span-full mt-4" onClick={handleCreate}>
            Create
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classroom Timetable</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Day</th>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Subject</th>
                <th className="p-2 border">Teacher</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-2 border">{days[e.timeslot.dayOfWeek]}</td>
                  <td className="p-2 border">
                    {e.timeslot.startTime} - {e.timeslot.endTime}
                  </td>
                  <td className="p-2 border">{e.subject.name}</td>
                  <td className="p-2 border">{e.teacher.fullName}</td>
                  <td className="p-2 border">
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(e.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
