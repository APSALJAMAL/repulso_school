"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import { getCookie } from "cookies-next";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import logo from "@/app/favicon.ico";
import { CustomField, CustomValue } from "@/types/custom";

interface PortfolioProps {
  schoolId: string;
  userId: string;
}

interface Member {
  id: string | number;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role: string;
  rollNumber: string;
  groups: {
    id: number;
    name: string;
    parentId: number | null;
  }[];
}

export default function Portfolio({ schoolId, userId }: PortfolioProps) {
  const [member, setMember] = useState<Member | null>(null);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [values, setValues] = useState<CustomValue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMember = async () => {
    try {
      setLoading(true);
      const token = getCookie("token");

      const headers = { Authorization: token as string };

      const [memberRes, fieldsRes, valuesRes] = await Promise.all([
        axios.get(`/school/${schoolId}/allschoolmember`, { headers }),
        axios.get(`/fields/school/${schoolId}`, { headers }),
        axios.get("/values", { headers }),
      ]);

      const members: Member[] = memberRes.data || [];
      const matched = members.find(
        (m) => m.id.toString() === userId.toString(),
      );

      setMember(matched || null);
      setFields(fieldsRes.data || []);
      setValues(valuesRes.data || []);
      console.log("field", fieldsRes);
    } catch (error) {
      console.error("❌ Failed to load member:", error);
    } finally {
      setLoading(false);
    }
  };

  const getValue = (fieldId: number) => {
    const val = values.find(
      (v) =>
        v.fieldId === fieldId && v.userId?.toString() === userId.toString(),
    );
    return val?.value;
  };

  useEffect(() => {
    if (schoolId && userId) fetchMember();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId, userId]);

  if (loading || !member) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-1/2 mb-4" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-5xl mx-auto space-y-8">
      <div className="relative bg-primary rounded-xl shadow-lg text-white p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Image
            src={member.avatarUrl || logo}
            alt="User Avatar"
            width={100}
            height={100}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white object-cover shadow-md"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold">{member.fullName}</h1>
            <p className="text-sm opacity-90">{member.email}</p>
            <p className="text-sm opacity-90">
              Roll Number :{member.rollNumber}
            </p>
            <p className="text-sm opacity-90">ID: {member.id}</p>
            {/* <p className="text-sm opacity-90">ID: {member.groups.}</p> */}
            <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold bg-white text-foreground rounded-full">
              {member.role}
            </span>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 sm:p-10">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
          About Me
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {fields.map((field) => (
            <div key={field.id} className="space-y-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {field.label}
              </p>
              <p className="text-base text-gray-800 dark:text-gray-100 font-semibold">
                {getValue(field.id) || "—"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
