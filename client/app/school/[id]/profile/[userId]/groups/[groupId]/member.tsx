"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Member {
  id: number;
  avatarUrl: string;
  fullName: string;
  email: string;
  role: string;
}

interface GroupResponse {
  id: number;
  name: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  members: Member[];
}

const GroupMembersPage = () => {
  const { id, groupId } = useParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [groupName, setGroupName] = useState<string>("");

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/school/${id}/group/${groupId}/member`,
        );
        if (!response.ok) throw new Error("Failed to fetch members");

        const data: GroupResponse = await response.json();
        setMembers(data.members);
        setGroupName(data.name);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    if (id && groupId) fetchMembers();
  }, [id, groupId]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Members of {groupName}</h1>

      {members.length === 0 ? (
        <p className="text-gray-500">No members found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {members.map((member) => (
            <div
              key={member.id}
              className="bg-white border rounded-lg p-4 shadow hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-4">
                <Image
                  src={member.avatarUrl}
                  alt={member.fullName}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <h2 className="text-lg font-semibold">{member.fullName}</h2>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  <span className="mt-1 inline-block text-xs font-medium   px-2 py-0.5 rounded">
                    {member.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupMembersPage;
