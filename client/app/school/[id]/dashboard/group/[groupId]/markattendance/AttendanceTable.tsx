/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { saveStatus } from "./actions";

const statusOptions = ["PRESENT", "ABSENT", "LATE", "HOLIDAY"];

interface Props {
  users: any[];
  attendance: any;
}

export default function AttendanceTable({ users, attendance }: Props) {
  const [statuses, setStatuses] = useState(attendance.statuses || []);

  useEffect(() => {
    setStatuses(attendance.statuses || []);
  }, [attendance.statuses]);

  const handleChange = async (userId: number, status: string) => {
    try {
      const updated = await saveStatus(attendance.id, userId, status);
      const statusObj = { ...updated, userId };

      const index = statuses.findIndex((s: any) => s.userId === userId);
      if (index !== -1) {
        const updatedStatuses = [...statuses];
        updatedStatuses[index] = statusObj;
        setStatuses(updatedStatuses);
      } else {
        setStatuses([...statuses, statusObj]);
      }
    } catch (err) {
      console.error("Failed to save status:", err);
      alert("Failed to update status. Please try again.");
    }
  };

  if (!Array.isArray(users)) {
    return <p className="text-red-500">Invalid user data</p>;
  }

  return (
    <table className="w-full border mt-6 text-sm">
      <thead>
        <tr className="bg-gray-100">
          <th className="text-left p-2">Student</th>
          <th className="text-left p-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => {
          const userStatus = statuses.find((s: any) => s.userId === user.id);
          return (
            <tr key={user.id} className="border-b">
              <td className="p-2">{user.fullName}</td>
              <td className="p-2">
                <Select
                  value={userStatus?.status}
                  onValueChange={(val) => handleChange(user.id, val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
