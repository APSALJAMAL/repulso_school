export type SessionType = "FN" | "AN";

export interface Exam {
  user: any;
  group: any;
  id: number;
  name: string;
  date: string;
  session: SessionType;
  time: string;
  batch?: string;
  groupId: number;
  createdAt: string;
  updatedAt: string;
}
