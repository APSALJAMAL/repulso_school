"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import DatePicker from "react-datepicker";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import "react-datepicker/dist/react-datepicker.css";

interface Subject {
  id: number;
  name: string;
}

interface Entry {
  id: number;
  subjectId: number;
  subject: Subject;
  maxMarks: number;
  minMarks?: number | null;
  date: string;
  session: "FN" | "AN";
  time: string;
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
  entries: Entry[];
}

interface Props {
  examId: string;
  schoolId: string;
  subjects: Subject[];
}

export default function ExamDetailClient({ examId, subjects }: Props) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  const initialForm = {
    subjectId: "",
    maxMarks: "",
    minMarks: "",
    date: new Date(),
    session: "FN" as "FN" | "AN",
    time: "",
  };

  const [form, setForm] = useState(initialForm);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(initialForm);

  const fetchExam = async () => {
    try {
      const res = await fetch(`http://localhost:5555/api/exams/${examId}`);
      if (!res.ok) throw new Error("Failed to fetch exam");
      const data = await res.json();
      setExam(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error("Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string | Date) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleEditInputChange = (key: string, value: string | Date) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = (data: typeof form) =>
    data.subjectId && data.maxMarks && data.date && data.time;

  const createEntry = async () => {
    if (!validateForm(form)) {
      return toast.error("Please fill all required fields.");
    }

    try {
      const res = await fetch("http://localhost:5555/api/exams/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: Number(examId),
          subjectId: Number(form.subjectId),
          maxMarks: parseFloat(form.maxMarks),
          minMarks: form.minMarks ? parseFloat(form.minMarks) : null,
          date: form.date.toISOString(),
          session: form.session,
          time: form.time,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success("Subject added to exam");
      setForm(initialForm);
      fetchExam();
    } catch {
      toast.error("Error adding subject");
    }
  };

  const updateEntry = async (entryId: number) => {
    if (!validateForm(editForm)) {
      return toast.error("Please fill all required fields.");
    }

    try {
      const res = await fetch(
        `http://localhost:5555/api/exams/entry/${entryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subjectId: Number(editForm.subjectId),
            maxMarks: parseFloat(editForm.maxMarks),
            minMarks: editForm.minMarks ? parseFloat(editForm.minMarks) : null,
            date: editForm.date.toISOString(),
            session: editForm.session,
            time: editForm.time,
          }),
        },
      );

      if (!res.ok) throw new Error();
      toast.success("Entry updated");
      setEditingEntryId(null);
      fetchExam();
    } catch {
      toast.error("Failed to update entry");
    }
  };

  const deleteEntry = async (entryId: number) => {
    try {
      const res = await fetch(
        `http://localhost:5555/api/exams/entry/${entryId}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) throw new Error();
      toast.success("Entry deleted");
      fetchExam();
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  useEffect(() => {
    fetchExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !exam) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading Exam...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-10 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Subject Form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Timetable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Subject</Label>
              <select
                value={form.subjectId}
                onChange={(e) => handleInputChange("subjectId", e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select Subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <Label className="pr-2">Date</Label>
            <div>
              <DatePicker
                selected={form.date}
                onChange={(date) => date && handleInputChange("date", date)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Session</Label>
                <Select
                  value={form.session}
                  onValueChange={(val) =>
                    handleInputChange("session", val as "FN" | "AN")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FN">FN</SelectItem>
                    <SelectItem value="AN">AN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  placeholder="e.g. 09:00 - 12:00"
                  value={form.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Max Marks</Label>
                <Input
                  type="number"
                  value={form.maxMarks}
                  onChange={(e) =>
                    handleInputChange("maxMarks", e.target.value)
                  }
                  placeholder="e.g. 100"
                />
              </div>
              <div>
                <Label>Min Marks</Label>
                <Input
                  type="number"
                  value={form.minMarks}
                  onChange={(e) =>
                    handleInputChange("minMarks", e.target.value)
                  }
                  placeholder="e.g. 35"
                />
              </div>
            </div>

            <Button onClick={createEntry}>Add Subject</Button>
            <Card className="bg-yellow-100  border-yellow-400 text-yellow-800">
              <CardContent className="p-4">
                ⚠️ You can't create the same subject more than once for this
                exam.
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Exam Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{exam.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              <strong>Batch:</strong> {exam.batch || "-"}
            </p>
            <p>
              <strong>Group:</strong> {exam.group?.name}
            </p>

            <h3 className="text-lg font-semibold mt-4">Subjects</h3>
            {exam.entries.length ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exam.entries.map((entry) => (
                  <li key={entry.id} className="border p-4 rounded space-y-2">
                    {editingEntryId === entry.id ? (
                      <>
                        <select
                          value={editForm.subjectId}
                          onChange={(e) =>
                            handleEditInputChange("subjectId", e.target.value)
                          }
                          className="w-full border rounded px-3 py-2"
                        >
                          <option value="">Select Subject</option>
                          {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>

                        <DatePicker
                          selected={editForm.date}
                          onChange={(date) =>
                            date && handleEditInputChange("date", date)
                          }
                          className="w-full border rounded px-3 py-2"
                        />

                        <Select
                          value={editForm.session}
                          onValueChange={(val) =>
                            handleEditInputChange("session", val as "FN" | "AN")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Session" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FN">FN</SelectItem>
                            <SelectItem value="AN">AN</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Time"
                          value={editForm.time}
                          onChange={(e) =>
                            handleEditInputChange("time", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Max Marks"
                          type="number"
                          value={editForm.maxMarks}
                          onChange={(e) =>
                            handleEditInputChange("maxMarks", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Min Marks"
                          type="number"
                          value={editForm.minMarks}
                          onChange={(e) =>
                            handleEditInputChange("minMarks", e.target.value)
                          }
                        />

                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => updateEntry(entry.id)}
                            className="bg-green-600"
                          >
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setEditingEntryId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold">{entry.subject?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.date).toDateString()} |{" "}
                          {entry.session} | {entry.time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Max: {entry.maxMarks} | Min: {entry.minMarks ?? "-"}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingEntryId(entry.id);
                              setEditForm({
                                subjectId: entry.subjectId.toString(),
                                maxMarks: entry.maxMarks.toString(),
                                minMarks: entry.minMarks?.toString() || "",
                                date: new Date(entry.date),
                                session: entry.session,
                                time: entry.time,
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteEntry(entry.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">No entries yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
