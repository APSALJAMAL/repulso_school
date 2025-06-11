/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

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

export default function CreateExamPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params?.id as string;

  const [name, setName] = useState("");
  const [batch, setBatch] = useState("");
  const [groupId, setGroupId] = useState<number | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch(
          `http://localhost:5555/api/school/${schoolId}/group`,
        );
        const data = await res.json();
        setGroups(data);
      } catch (err) {
        toast.error("Failed to load groups");
      }
    };

    if (schoolId) fetchGroups();
  }, [schoolId]);

  const handleSubmit = async () => {
    if (!name || !groupId) {
      toast.error("Please fill all required fields");
      return;
    }

    const res = await fetch("http://localhost:5555/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, batch, groupId }),
    });

    if (res.ok) {
      toast.success("Exam created successfully");
      router.push(`/school/${schoolId}/dashboard/exams`);
    } else {
      toast.error("Failed to create exam");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle>Create Exam</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Exam Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select
            value={groupId?.toString()}
            onValueChange={(val) => setGroupId(Number(val))}
          >
            <SelectTrigger>
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
          />
          <Button onClick={handleSubmit} className="w-full">
            Create
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
