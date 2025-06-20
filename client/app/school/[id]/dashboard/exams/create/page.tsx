/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { getCookie } from "cookies-next";

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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const rawToken = await getCookie("token");
        const token = typeof rawToken === "string" ? rawToken : "";
        if (!token) throw new Error("Token missing");

        const res = await fetch(
          `http://localhost:5555/api/school/${schoolId}/group`,
          {
            headers: { Authorization: token },
          },
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to fetch groups");
        }

        const data = await res.json();
        setGroups(data);
      } catch (err: any) {
        console.error("❌ fetchGroups error:", err.message || err);
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

    try {
      setIsLoading(true);

      const rawToken = await getCookie("token");
      const token = typeof rawToken === "string" ? rawToken : "";
      if (!token) {
        toast.error("Unauthorized: Token missing");
        setIsLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5555/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ name, batch, groupId, schoolId }), // ✅ send schoolId
      });

      if (res.ok) {
        toast.success("✅ Exam created successfully");
        router.push(`/school/${schoolId}/dashboard/exams`);
      } else {
        const errorText = await res.text();
        console.error("❌ Create exam error:", errorText);
        toast.error("Failed to create exam");
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center bg-muted/20 min-h-screen">
      <Card className="w-full max-w-xl shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Create New Exam
          </CardTitle>
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
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white"
          >
            {isLoading ? "Creating..." : "Create Exam"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
