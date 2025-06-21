/* eslint-disable @typescript-eslint/no-explicit-any */
import SubjectsList from "@/components/features/dashboard/subjects/SubjectsList";
import AddSubject from "@/components/features/dashboard/subjects/AddSubject";
import axios from "@/lib/axiosInstance";
import { cookies } from "next/headers";

export default async function SubjectsPage({
  params,
}: {
  params: { id: string };
}) {
  const schoolId = params.id;
  const cookieStore = cookies();
  const token = (await cookieStore).get("token")?.value;

  const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, {
    headers: {
      Authorization: token,
    },
  });

  const user = res.data;
  const userId = user.id;
  const school = user.schools.find((s: any) => s.schoolId === schoolId);
  const role = school?.role ?? "STUDENT";
  console.log("Role", role);
  console.log("SubjectsPage debug:", { userId, role, schoolId, user });

  return (
    <div className="relative flex w-full flex-col gap-8 p-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl font-semibold">Subjects</h1>
        <AddSubject schoolId={schoolId} />
      </div>
      <SubjectsList schoolId={schoolId} userId={userId} role={role} />
    </div>
  );
}
