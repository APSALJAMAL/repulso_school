// /app/school/[id]/dashboard/markattendance/actions.ts
import axios from "@/lib/axiosInstance";

export const fetchGroupMembers = async (schoolId: string, groupId: number) => {
  try {
    const res = await axios.get(`/school/${schoolId}/group/${groupId}/member`);
    console.log("Group Members response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching group members:", error);
    return [];
  }
};

export const fetchAttendance = async (groupId: number, date: string) => {
  const res = await axios.get(`/markattendance/${groupId}?date=${date}`);
  return res.data;
};

export const createAttendance = async (data: {
  groupId: number;
  date: string;
  note?: string;
}) => {
  const res = await axios.post("/markattendance", data);
  return res.data;
};

export const saveStatus = async (
  attendanceId: number,
  userId: number,
  status: string,
) => {
  const res = await axios.post(`/markattendance/${attendanceId}/status`, {
    userId,
    status,
  });
  return res.data;
};
