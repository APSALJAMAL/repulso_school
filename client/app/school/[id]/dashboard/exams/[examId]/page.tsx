// app/school/[id]/exam/[examId]/page.tsx

import { getSubjects } from "@/fetches/subjects";
import ExamDetailClient from "./ExamDetailWrapper";

interface Props {
  params: {
    id: string;
    examId: string;
  };
}

export default async function ExamDetailPage({ params }: Props) {
  const subjects = await getSubjects(params.id);

  return (
    <ExamDetailClient
      examId={params.examId}
      schoolId={params.id}
      subjects={subjects} // <-- Pass the subjects here
    />
  );
}
