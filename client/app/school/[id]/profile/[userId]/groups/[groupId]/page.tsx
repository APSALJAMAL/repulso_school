/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface Group {
  id: number;
  name: string;
}

interface AnnouncementMessage {
  id: number;
  content: string;
  createdAt: string;
  createdBy: {
    id: number;
    fullName: string;
    avatarUrl?: string;
  };
}

interface AnnouncementBoard {
  id: number;
  groupId: number;
  createdAt: string;
  messages: AnnouncementMessage[];
}

export default function GroupDetailsPage() {
  const { id: schoolId, groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [boards, setBoards] = useState<AnnouncementBoard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGroup() {
      const res = await fetch(
        `http://localhost:5555/api/school/${schoolId}/group/${groupId}`,
      );
      const data = await res.json();
      setGroup(data);
    }

    async function fetchBoardsWithMessages() {
      try {
        // Fetch all boards
        const boardsRes = await fetch(
          "http://localhost:5555/api/announcements/boards",
        );
        const allBoards: Omit<AnnouncementBoard, "messages">[] =
          await boardsRes.json();

        // Filter boards for the current group
        const groupBoards = allBoards.filter(
          (b) => b.groupId === Number(groupId),
        );

        // Fetch messages per board
        const boardsWithMessages: AnnouncementBoard[] = await Promise.all(
          groupBoards.map(async (board) => {
            const msgRes = await fetch(
              `http://localhost:5555/api/announcements/board/${board.id}/messages`,
            );
            const messages: AnnouncementMessage[] = await msgRes.json();
            return { ...board, messages };
          }),
        );

        setBoards(boardsWithMessages);
      } catch (error) {
        console.error("Error fetching boards or messages:", error);
      }
    }

    async function fetchAll() {
      setLoading(true);
      try {
        await Promise.all([fetchGroup(), fetchBoardsWithMessages()]);
      } finally {
        setLoading(false);
      }
    }

    if (schoolId && groupId) {
      fetchAll();
    }
  }, [schoolId, groupId]);

  if (loading) return <p>Loading...</p>;
  if (!group) return <p>Group not found.</p>;

  return (
    <div className="p-6 w-3xl space-y-8">
      {/* Group Info */}
      <div>
        <h2 className="text-2xl font-bold">{group.name}</h2>
        <p className="text-gray-600">Group ID: {group.id}</p>
      </div>

      {/* Announcement Boards */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Announcement Boards</h3>

        {boards.length === 0 ? (
          <p className="text-gray-500">No boards found for this group.</p>
        ) : (
          boards.map((board) => (
            <div key={board.id} className="border p-4 rounded shadow-sm mb-6">
              <p className="text-sm text-gray-400 mb-2">Board ID: {board.id}</p>

              {board.messages.length === 0 ? (
                <p className="italic text-gray-500">
                  No messages in this board.
                </p>
              ) : (
                <ul className="space-y-4">
                  {board.messages.map((msg) => (
                    <li key={msg.id} className="bg-gray-50 p-3 rounded border">
                      <div className="flex items-center space-x-2 mb-1">
                        {msg.createdBy?.avatarUrl && (
                          <img
                            src={msg.createdBy.avatarUrl}
                            alt={msg.createdBy.fullName}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="font-medium">
                          {msg.createdBy.fullName}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
