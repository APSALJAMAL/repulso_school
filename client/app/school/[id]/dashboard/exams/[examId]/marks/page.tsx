// app/exams/[examId]/page.tsx
import axios from "@/lib/axiosInstance";
import { cookies } from "next/headers";
import ExamMarksPageClient from "./ExamMarksPageClient";
import ExamMarksTable from "./ExamMarksTable";

export default async function ExamMarksPage({
  params,
}: {
  params: { examId: string };
}) {
  const examId = params.examId;
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value || "";

  const headers = { Authorization: token };

  // 1. Fetch Exam to get groupId & schoolId
  const { data: exam } = await axios.get(`/exams/${examId}`, { headers });
  const groupId = exam.groupId;
  const schoolId = exam.group?.schoolId || exam.schoolId || "";

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <ExamMarksPageClient
        examId={examId}
        schoolId={schoolId}
        groupId={groupId}
      />
      <ExamMarksTable examId={Number(examId)} />
    </div>
  );
}
