import AttendanceList from "./AttendanceList";

export default function GroupAttendancePage({
  params,
}: {
  params: { groupId: string };
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Group Attendance</h1>
      <AttendanceList groupId={params.groupId} />
    </div>
  );
}
