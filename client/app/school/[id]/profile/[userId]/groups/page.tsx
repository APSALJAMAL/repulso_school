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
  // ✅ Step 1: Use correct param names based on your folder structure
  const params = useParams();
  const schoolId = params?.id as string; // folder: /school/[id]/
  const userId = params?.userId as string; // folder: /profile/[userId]/...

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroups() {
      try {
        const res = await fetch(
          `http://localhost:5555/api/user/${userId}/groups`,
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`❌ Failed to fetch: ${res.status} ${errorText}`);
        }

        const groupData: Group[] = await res.json(); // ✅ use only once
        console.log("Fetched groups:", groupData);

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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Your Groups</h2>
      {filteredGroups.length === 0 ? (
        <p className="text-gray-500">You are not in any groups yet.</p>
      ) : (
        <ul className="space-y-2">
          {filteredGroups.map((group) => (
            <li key={group.id} className="p-3 border rounded shadow-sm">
              <Link
                href={`/school/${schoolId}/profile/${userId}/groups/${group.id}`}
                className="text-blue-600 hover:underline"
              >
                {group.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
