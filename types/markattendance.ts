export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  LATE = "LATE",
  HOLIDAY = "HOLIDAY",
}

export type Attendance = {
  id: number;
  date: string;
  note?: string;
  groupId: number;
};

export type Status = {
  id: number;
  userId: number;
  status: AttendanceStatus;
  attendanceId: number;
};
