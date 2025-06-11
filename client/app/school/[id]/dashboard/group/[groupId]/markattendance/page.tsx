/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AttendanceForm from "./AttendanceForm";
import AttendanceTable from "./AttendanceTable";
import { fetchGroupMembers } from "./actions";

export default function MarkAttendancePage() {
  const params = useParams();
  const schoolId = params?.id as string;

  const groupId = Number(params?.groupId);
  console.log(schoolId);
  console.log(groupId);
  // group ID from route param

  const [members, setMembers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);

  useEffect(() => {
    if (schoolId && groupId) {
      fetchGroupMembers(schoolId, groupId).then((data) => {
        console.log("Group Members:", data);
        // ✅ Fix: extract .members
        setMembers(Array.isArray(data.members) ? data.members : []);
      });
    }
  }, [schoolId, groupId]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Mark Attendance</h1>
      <AttendanceForm groupId={groupId} onAttendanceLoaded={setAttendance} />
      {attendance && members.length >= 0 && (
        <AttendanceTable users={members} attendance={attendance} />
      )}
    </div>
  );
}
