/* eslint-disable @typescript-eslint/no-explicit-any */
import GroupList from "@/components/features/dashboard/groups/GroupsList";
import AddGroup from "@/components/features/dashboard/groups/AddGroup";
import { getMembers } from "@/fetches/member";
import { cookies } from "next/headers";
import { GroupType } from "@/types/Group";
import axios from "@/lib/axiosInstance";
import { formatGroups } from "@/lib/utils";

async function getUser() {
  const token = (await cookies()).get("token")?.value;
  const res = await axios.get("/me", {
    headers: { Authorization: token },
  });
  return res.data;
}

async function getGroups(schoolId: string, role: string, userId: number) {
  const token = (await cookies()).get("token")?.value;

  const res = await axios.get<GroupType[]>(`/school/${schoolId}/group`, {
    headers: { Authorization: token },
    params: role === "SUPER_ADMIN" ? {} : { userId },
  });

  return formatGroups(res.data);
}

export default async function GroupsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const schoolId = (await params).id;

  const user = await getUser();
  const school = user.schools.find((s: any) => s.schoolId === schoolId);
  const role = school?.role ?? "STUDENT";
  const userId = user.id;

  const members = await getMembers(schoolId);
  const groups = await getGroups(schoolId, role, userId);
  console.log("SubjectsPage debug:", { userId, role, schoolId, user });

  return (
    <div className="relative flex w-full flex-col gap-8 p-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-3xl font-semibold">Groups</h1>
        <AddGroup groups={groups} schoolId={schoolId} />
      </div>
      <GroupList schoolId={schoolId} groups={groups} data={members} />
    </div>
  );
}
