/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  rollNumber: string;
}

interface Group {
  id: number;
  name: string;
  schoolId: string;
  members: User[];
}

interface Props {
  id: string; // schoolId
  groupId: string;
}

const GroupPageClient: React.FC<Props> = ({ id, groupId }) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    async function fetchGroup() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/school/${id}/group/${groupId}`,
        );

        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setGroup(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchGroup();
  }, [id, groupId]);

  if (loading)
    return (
      <div className="p-6 text-lg font-medium text-muted-foreground">
        Loading group data...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-lg font-medium text-red-600">Error: {error}</div>
    );

  if (!group)
    return (
      <div className="p-6 text-lg font-medium text-muted-foreground">
        No group data available.
      </div>
    );

  return (
    <div className="p-6 space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-4xl font-bold text-primary mb-1">{group.name}</h1>
        <p className="text-sm text-muted-foreground">
          School ID: {group.schoolId}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b pb-2">
        <Link
          href={`/school/${id}/dashboard/group/${groupId}`}
          className={`text-sm font-medium pb-1 border-b-2 transition-all ${
            pathname === `/school/${id}/dashboard/group/${groupId}`
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-primary"
          }`}
        >
          Group Members
        </Link>
        <Link
          href={`/school/${id}/dashboard/group/${groupId}/markattendance`}
          className={`text-sm font-medium pb-1 border-b-2 transition-all ${
            pathname ===
            `/school/${id}/dashboard/group/${groupId}/markattendance`
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-primary"
          }`}
        >
          Mark Attendance
        </Link>
      </div>

      {/* Members Section */}
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">Group Members</h2>
        {group.members.length === 0 ? (
          <p className="text-muted-foreground">No members in this group.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.members.map((member) => (
              <li key={member.id}>
                <Link
                  href={`/school/${id}/profile/${member.id}/details`}
                  className="block transform rounded-2xl border border-border bg-background p-5 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    {member.avatarUrl ? (
                      <Image
                        src={member.avatarUrl}
                        alt={member.fullName}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gray-300" />
                    )}
                    <div className="space-y-1">
                      <p className="text-lg font-semibold">{member.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.rollNumber || "N/A"}
                      </p>
                      <Badge className="text-sm">{member.role}</Badge>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GroupPageClient;
