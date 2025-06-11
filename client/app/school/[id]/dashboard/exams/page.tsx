/* File: app/dashboard/exams/page.tsx */

"use client";

import { useEffect, useState } from "react";
import { getExams } from "@/fetches/exam";
import { Exam } from "@/types/exam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <Button asChild className="gap-2">
          <Link href={`/school/${id}/dashboard/exams/create`}>
            <PlusCircle className="w-5 h-5" /> Create Exam
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <Card key={exam.id} className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{exam.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exam.batch && <p className="text-sm">Batch: {exam.batch}</p>}
              <Link
                href={`/school/${id}/dashboard/exams/${exam.id}`}
                className="inline-block text-primary hover:underline text-sm font-medium"
              >
                View Details
              </Link>
            </CardContent>
            <CardContent>
              {exam.batch && <p className="text-sm">Batch: {exam.batch}</p>}
              <Link
                href={`/school/${id}/dashboard/exams/${exam.id}/marks`}
                className="inline-block text-primary hover:underline text-sm font-medium"
              >
                View Marks
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
