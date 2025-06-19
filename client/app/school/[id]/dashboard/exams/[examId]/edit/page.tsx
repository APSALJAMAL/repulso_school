/* eslint-disable react-hooks/exhaustive-deps */
"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Group {
  id: number;
  name: string;
}

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params?.id as string;
  const examId = params?.examId as string;

  const [name, setName] = useState("");
  const [batch, setBatch] = useState("");
  const [groupId, setGroupId] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (schoolId) {
      fetchGroups();
    }
    if (examId) {
      fetchExamDetails();
    }
  }, [schoolId, examId]);

  const fetchGroups = async () => {
    try {
      const res = await fetch(
        `http://localhost:5555/api/school/${schoolId}/group`,
      );
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      toast.error("❌ Failed to load groups");
    }
  };

  const fetchExamDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5555/api/exams/${examId}`);
      if (!res.ok) throw new Error("Failed to fetch exam");

      const exam = await res.json();
      setName(exam.name || "");
      setBatch(exam.batch || "");
      setGroupId(exam.groupId || null);
    } catch (err) {
      toast.error("❌ Failed to fetch exam details");
    }
  };

  const handleUpdate = async () => {
    if (!name || !groupId) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5555/api/exams/${examId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, batch, groupId }),
      });

      if (res.ok) {
        toast.success("✅ Exam updated successfully");
        router.push(`/school/${schoolId}/dashboard/exams`);
      } else {
        toast.error("❌ Failed to update exam");
      }
    } catch (err) {
      toast.error("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-40 flex items-center justify-center px-4 bg-muted/20">
      <Card className="w-full max-w-xl shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Edit Exam</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Exam Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="focus-visible:ring-primary"
          />

          <Select
            value={groupId?.toString()}
            onValueChange={(val) => setGroupId(Number(val))}
          >
            <SelectTrigger className="focus:ring-primary">
              <SelectValue placeholder="Select Group" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id.toString()}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Batch (optional)"
            value={batch}
            onChange={(e) => setBatch(e.target.value)}
            className="focus-visible:ring-primary"
          />

          <Button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white"
          >
            {loading ? "Updating..." : "Update Exam"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
