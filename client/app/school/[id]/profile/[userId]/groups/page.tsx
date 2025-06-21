"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Group {
  id: number;
  name: string;
  members: { userId: number }[];
}

export default function GroupListPage() {
  const params = useParams();
  const schoolId = params?.id as string;
  const userId = params?.userId as string;

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/${userId}/groups`,
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`❌ Failed to fetch: ${res.status} ${errorText}`);
        }

        const groupData: Group[] = await res.json();
        const sanitized = groupData.map((g) => ({
          ...g,
          members: Array.isArray(g.members) ? g.members : [],
        }));

        setGroups(sanitized);
      } catch (err) {
        console.error("Group fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (schoolId && userId) fetchGroups();
  }, [schoolId, userId]);

  const filteredGroups = groups.filter((group) =>
    group.members.some((member) => member.userId === Number(userId)),
  );

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-6">Your Groups</h2>
      {filteredGroups.length === 0 ? (
        <p className="text-gray-500">You are not in any groups yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGroups.map((group) => (
            <Link
              key={group.id}
              href={`/school/${schoolId}/profile/${userId}/groups/${group.id}`}
              className="relative block rounded-lg overflow-hidden border shadow-sm hover:shadow-md transition bg-white group"
            >
              {/* Diagonal Top Banner */}
              <div className="h-20 bg-gradient-to-r from-green-700 to-emerald-900 transform -skew-y-6 origin-top-left"></div>

              {/* Card Content */}
              <div className="p-4 pt-6">
                <h3 className="text-lg font-medium text-gray-800 group-hover:text-primary">
                  {group.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {group.members.length} member
                  {group.members.length !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
