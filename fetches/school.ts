/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";
import axios from "@/lib/axiosInstance";

export async function getSchool(schoolId: string) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
      throw new Error("Unauthorized: No token found");
    }

    const res = await axios.get(`/school/${schoolId}`, {
      headers: { Authorization: token },
    });

    return res.data;
  } catch (err: any) {
    console.error(err?.response?.data || "Unexpected error occurred");
    return null; // Return null to avoid crashing
  }
}
