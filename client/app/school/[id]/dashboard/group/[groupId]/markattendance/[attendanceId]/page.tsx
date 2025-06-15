import MonthlyAttendance from "./AttendanceTable"; // adjust path as needed
import { notFound } from "next/navigation";

interface PageProps {
  params: {
    id: string;
    groupId: string;
    attendanceId: string;
  };
}

export default function Page({ params }: PageProps) {
  const { id, groupId, attendanceId } = params;

  const parsedGroupId = parseInt(groupId);
  const parsedAttendanceId = parseInt(attendanceId);

  if (isNaN(parsedGroupId) || isNaN(parsedAttendanceId)) {
    notFound();
  }
  console.log("tghj", id);

  return (
    <div className="p-4">
      <MonthlyAttendance
        schoolId={id}
        groupId={parsedGroupId}
        attendanceId={parsedAttendanceId}
      />
    </div>
  );
}
