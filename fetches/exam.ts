import { Exam } from "@/types/exam";

const API_BASE_URL = "http://localhost:5555/api/exams";

export const getExams = async (): Promise<Exam[]> => {
  const res = await fetch(`${API_BASE_URL}`, {
    cache: "no-store", // optional: disables caching
  });
  return res.json();
};

export const createExam = async (data: Partial<Exam>) => {
  const res = await fetch(`${API_BASE_URL}`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
};
