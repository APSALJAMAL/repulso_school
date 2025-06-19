"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import CreateAttendance from "./CreateAttendance";
import AttendanceList from "./AttendanceList";

export default function MarkAttendancePage() {
  const params = useParams();
  const schoolId = params?.id as string;
  const groupId = Number(params?.groupId);
  const pathname = usePathname();

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-primary mb-1">
          Mark Attendance
        </h1>
        <p className="text-sm text-muted-foreground">Group ID: {groupId}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b pb-2">
        <Link
          href={`/school/${schoolId}/dashboard/group/${groupId}`}
          className={`text-sm font-medium pb-1 border-b-2 transition-all ${
            pathname === `/school/${schoolId}/dashboard/group/${groupId}`
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-primary"
          }`}
        >
          Group Members
        </Link>
        <Link
          href={`/school/${schoolId}/dashboard/group/${groupId}/markattendance`}
          className={`text-sm font-medium pb-1 border-b-2 transition-all ${
            pathname ===
            `/school/${schoolId}/dashboard/group/${groupId}/markattendance`
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-primary"
          }`}
        >
          Mark Attendance
        </Link>
      </div>

      {/* Attendance Content */}
      <div className="space-y-6">
        <CreateAttendance groupId={groupId} />
        <AttendanceList schoolId={schoolId} groupId={groupId} />
      </div>
    </div>
  );
}
