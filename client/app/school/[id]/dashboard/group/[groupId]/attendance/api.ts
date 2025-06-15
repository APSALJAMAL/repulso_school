import axios from "axios";

const API = "http://localhost:5555/api/markattendance";

export const fetchAttendance = async (groupId: string) =>
  axios.get(`${API}/${groupId}`);

export const fetchStatuses = async (attendanceId: number) =>
  axios.get(`${API}/${attendanceId}/statuses`);

export const markUserStatus = async (
  attendanceId: number,
  userId: number,
  status: string,
) =>
  axios.post(`${API}/${attendanceId}/status`, {
    userId,
    status,
  });
