/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import useSWR from "swr";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CalendarCheck, FileText, Trash, Pencil } from "lucide-react";
import { Exam } from "@/types/exam";
import { getCookie } from "cookies-next";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ExamsPage() {
  const params = useParams();
  const schoolId = params?.id as string;

  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<{
    id: number;
    role: string;
  } | null>(null);

  // 🔐 Load current user from /api/me
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await getCookie("token");

        if (!token) throw new Error("Missing token");

        const res = await fetch("http://localhost:5555/api/me", {
          headers: { Authorization: token },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to fetch user");
        }

        const data = await res.json();

        const role =
          data?.schools?.find((s: any) => s.schoolId === schoolId)?.role ||
          "USER";

        setCurrentUser({ id: data.id, role });
      } catch (err) {
        console.error("❌ Failed to load user", err);
      }
    };

    if (schoolId) loadUser();
  }, [schoolId]);

  const {
    data: exams = [],
    isLoading,
    mutate,
  } = useSWR<Exam[]>(
    schoolId ? `http://localhost:5555/api/exams/school/${schoolId}` : null,
    fetcher,
    {
      onError: () => toast.error("❌ Failed to fetch exams"),
    },
  );

  const handleDelete = async (examId: number) => {
    const confirmed = confirm("Are you sure you want to delete this exam?");
    if (!confirmed) return;

    setLoadingId(examId);
    try {
      const res = await fetch(`http://localhost:5555/api/exams/${examId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      toast.success("🗑️ Exam deleted successfully");
      mutate(); // revalidate
    } catch {
      toast.error("❌ Error deleting exam");
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ Role-based filter
  const filteredExams =
    currentUser?.role === "ADMIN"
      ? exams.filter((exam) => exam.user?.id === currentUser.id)
      : exams;

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
            📝 Exams
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Keep track of all exams across batches.
          </p>
        </div>
        <Button
          asChild
          className="bg-primary text-white hover:opacity-90 transition"
        >
          <Link href={`/school/${schoolId}/dashboard/exams/create`}>
            <Plus className="w-5 h-5 mr-2" />
            Create Exam
          </Link>
        </Button>
      </div>

      {/* Exams List */}
      {isLoading || !currentUser ? (
        <div className="text-center text-muted-foreground">
          Loading exams...
        </div>
      ) : filteredExams.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {filteredExams.map((exam) => (
            <Card
              key={exam.id}
              className="border rounded-2xl shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md bg-white dark:bg-zinc-900"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold text-zinc-800 dark:text-white">
                      {exam.name}
                    </CardTitle>
                    {exam.batch && (
                      <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
                        🎓 Batch: {exam.batch}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Link
                      href={`/school/${schoolId}/dashboard/exams/${exam.id}/edit`}
                      className="flex items-center gap-1 hover:text-primary text-sm"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      onClick={() => handleDelete(exam.id)}
                      disabled={loadingId === exam.id}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-3">
                <Link
                  href={`/school/${schoolId}/dashboard/exams/${exam.id}`}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <CalendarCheck size={16} />
                  View Timetable
                </Link>

                <Link
                  href={`/school/${schoolId}/dashboard/exams/${exam.id}/marks`}
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  <FileText size={16} />
                  View Marks
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-20 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            😕 No exams created yet.
          </p>
          <p className="text-sm mt-2 text-muted-foreground">
            Start by clicking “Create Exam” above.
          </p>
        </div>
      )}
    </div>
  );
}
