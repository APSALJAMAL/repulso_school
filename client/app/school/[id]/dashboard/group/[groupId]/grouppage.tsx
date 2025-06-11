"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface User {
  id: number;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  role: string;
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

  useEffect(() => {
    async function fetchGroup() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `http://localhost:5555/api/school/${id}/group/${groupId}`,
        );

        if (!res.ok) {
          throw new Error(`Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setGroup(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchGroup();
  }, [id, groupId]);

  if (loading) return <div className="p-4">Loading group data...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!group) return <div className="p-4">No group data available.</div>;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{group.name}</h1>
        <p className="text-gray-600">School ID: {group.schoolId}</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Members</h2>
        {group.members.length === 0 ? (
          <p>No members in this group.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.members.map((member) => (
              <li key={member.id}>
                <Link
                  href={`/school/${id}/profile/${member.id}/details`}
                  className="block hover:shadow-lg transition rounded-lg border p-4 bg-white"
                >
                  <div className="flex items-center gap-4">
                    {member.avatarUrl ? (
                      <Image
                        src={member.avatarUrl}
                        alt={member.fullName}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full" />
                    )}
                    <div>
                      <p className="font-semibold">{member.fullName}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      <p className="text-sm text-blue-600">
                        Role: {member.role}
                      </p>
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
