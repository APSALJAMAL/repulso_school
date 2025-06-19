// app/exams/[examId]/page.tsx
import axios from "@/lib/axiosInstance";
import { cookies } from "next/headers";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
      <Tabs defaultValue="marks" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="marks">Marks</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="marks">
          <ExamMarksPageClient
            examId={examId}
            schoolId={schoolId}
            groupId={groupId}
          />
        </TabsContent>

        <TabsContent value="results">
          <ExamMarksTable
            examId={Number(examId)}
            schoolId={schoolId}
            groupId={groupId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
