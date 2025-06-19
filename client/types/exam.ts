export type SessionType = "FN" | "AN";

export interface Exam {
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
