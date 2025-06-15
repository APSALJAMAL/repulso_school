"use client";

import { useEffect, useState } from "react";
import { getExams } from "@/fetches/exam";
import { Exam } from "@/types/exam";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    getExams().then(setExams);
  }, []);

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <Button asChild className="gap-2">
          <Link href={`/school/${id}/dashboard/exams/create`}>
            <Plus className="w-5 h-5" />
            Create Exam
          </Link>
        </Button>
      </div>

      {/* Exam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card
            key={exam.id}
            className="transition-shadow duration-300 border hover:shadow-lg rounded-2xl"
          >
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {exam.name}
              </CardTitle>
              {exam.batch && (
                <CardDescription className="text-muted-foreground">
                  Batch: {exam.batch}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="space-y-3">
              <Link
                href={`/school/${id}/dashboard/exams/${exam.id}`}
                className="text-primary hover:underline text-sm font-medium block"
              >
                Timetable
              </Link>

              <Link
                href={`/school/${id}/dashboard/exams/${exam.id}/marks`}
                className="text-primary hover:underline text-sm font-medium block"
              >
                Marks
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {exams.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          <p>No exams created yet.</p>
        </div>
      )}
    </div>
  );
}
