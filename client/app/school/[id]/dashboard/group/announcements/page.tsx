"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash } from "lucide-react";
import { getCookie } from "cookies-next";
interface AnnouncementBoard {
  id: number;
  groupId: number;
  createdAt: string;
  group: {
    name: string;
  };
}

export default function AnnouncementsPage() {
  const params = useParams();
  const schoolId = params.id;
  const [boards, setBoards] = useState<AnnouncementBoard[]>([]);
  const [groupId, setGroupId] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState("");

  const fetchBoards = async () => {
    const res = await fetch("http://localhost:5555/api/announcements/boards");
    const data = await res.json();
    setBoards(Array.isArray(data) ? data : (data.boards ?? []));
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleCreate = async () => {
    if (!groupId.trim()) return;
    const rawToken = getCookie("token");
    const token = typeof rawToken === "string" ? rawToken : "";

    await fetch("http://localhost:5555/api/announcements/board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ groupId: Number(groupId) }),
    });

    setGroupId("");
    fetchBoards();
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm("Delete this board?");
    if (!confirm) return;

    await fetch(`http://localhost:5555/api/announcements/board/${id}`, {
      method: "DELETE",
    });

    fetchBoards();
  };

  const handleUpdate = async (id: number) => {
    if (!editingGroupId.trim()) return;

    await fetch(`http://localhost:5555/api/announcements/board/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId: Number(editingGroupId) }),
    });

    setEditingId(null);
    setEditingGroupId("");
    fetchBoards();
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Announcement Boards</h1>

      {/* Create new board */}
      <div className="flex w-2xs gap-2">
        <Input
          type="number"
          placeholder="Enter Group ID"
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
        />
        <Button onClick={handleCreate}>Create Board</Button>
      </div>

      {/* Boards list */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {boards.map((board) => (
          <Card key={board.id} className="hover:shadow-lg transition">
            <CardContent className="p-4 space-y-2">
              <Link
                href={`/school/${schoolId}/dashboard/group/announcements/${board.id}`}
                className="block"
              >
                <h2 className="text-lg font-semibold">
                  {board.group?.name}{" "}
                  <Badge variant="default" className="ml-2 text-sm">
                    Group Id {board.groupId}
                  </Badge>
                </h2>

                <p className="text-sm text-gray-500">
                  Created at {new Date(board.createdAt).toLocaleString()}
                </p>
              </Link>

              {editingId === board.id ? (
                <div className="flex gap-2 pt-2">
                  <Input
                    type="number"
                    value={editingGroupId}
                    onChange={(e) => setEditingGroupId(e.target.value)}
                    className="w-32"
                  />
                  <Button size="sm" onClick={() => handleUpdate(board.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingId(board.id);
                      setEditingGroupId(String(board.groupId));
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(board.id)}
                  >
                    <Trash />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
