export interface TimetableEntryInput {
  day: string;
  startTime: string;
  endTime: string;
  groupId: number;
  subjectId: number;
  teacherId: number;
  timeslotId: number;
}

export interface TimetableEntry extends TimetableEntryInput {
  id: number;
  group?: { id: number; name: string };
  subject?: { id: number; name: string };
  teacher?: { id: number; fullName: string };
}

const API_BASE = "http://localhost:5555/api/timetable";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.text();
    console.error("API Error:", res.status, errorBody);
    throw new Error(`API error ${res.status}: ${errorBody}`);
  }
  return res.json();
}

export async function getAllEntries(): Promise<TimetableEntry[]> {
  const res = await fetch(API_BASE);
  return handleResponse<TimetableEntry[]>(res);
}

export async function createEntry(
  data: TimetableEntryInput,
): Promise<TimetableEntry> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<TimetableEntry>(res);
}

export async function updateEntry(
  id: number,
  data: Partial<TimetableEntryInput>,
): Promise<TimetableEntry> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<TimetableEntry>(res);
}

export async function deleteEntry(id: number): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  return handleResponse<{ message: string }>(res);
}
