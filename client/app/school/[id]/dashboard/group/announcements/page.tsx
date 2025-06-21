"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash } from "lucide-react";
import { getCookie } from "cookies-next";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

interface AnnouncementBoard {
  id: number;
  groupId: number;
  createdAt: string;
  userId: number;
  group: {
    id: number;
    name: string;
    userId: number;
  };
}

interface Group {
  id: number;
  name: string;
  userId: number;
}

export default function AnnouncementsPage() {
  const params = useParams();
  const schoolId = params.id as string;

  const [boards, setBoards] = useState<AnnouncementBoard[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [userGroups, setUserGroups] = useState<number[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingGroupId, setEditingGroupId] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchToken = (): string => {
    const rawToken = getCookie("token");
    return typeof rawToken === "string" ? rawToken : "";
  };

  const fetchUserId = async () => {
    const token = fetchToken();
    if (!token) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, {
        headers: { Authorization: token },
      });
      const data = await res.json();
      if (res.ok && data?.id) {
        setUserId(data.id);
      }
    } catch (err) {
      console.error("Error fetching user ID:", err);
    }
  };

  const fetchGroups = async () => {
    const token = fetchToken();
    if (!token || !schoolId) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/school/${schoolId}/group`,
        {
          headers: { Authorization: token },
        },
      );
      const data = await res.json();
      const groupList = Array.isArray(data) ? data : data.groups || [];

      setGroups(groupList);
      setUserGroups(groupList.map((g: Group) => g.id));
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  };

  const fetchBoards = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/boards`,
      );
      const data = await res.json();
      const allBoards = Array.isArray(data) ? data : (data.boards ?? []);

      // Filter boards to only those the current user has group access to
      const filteredBoards = allBoards.filter((b: AnnouncementBoard) =>
        userGroups.includes(b.groupId),
      );

      setBoards(filteredBoards);
    } catch (err) {
      console.error("Error fetching boards:", err);
    }
  };

  useEffect(() => {
    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchGroups();
    }
  }, [userId]);

  useEffect(() => {
    if (userGroups.length > 0) {
      fetchBoards();
    }
  }, [userGroups]);

  const handleCreate = async () => {
    if (!selectedGroupId || !schoolId || !userId) return;

    const token = fetchToken();
    setCreating(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/board`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            groupId: Number(selectedGroupId),
            schoolId,
            userId,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        if (data?.error?.toLowerCase()?.includes("already")) {
          toast.warning("Board already exists for this group.");
        } else {
          toast.error(data?.error || "Failed to create board.");
        }
        return;
      }

      toast.success("Board created successfully!");
      setSelectedGroupId("");
      await fetchGroups(); // refresh userGroups
      await fetchBoards(); // filtered again
    } catch (err) {
      console.error("Error creating board:", err);
      toast.error("Something went wrong while creating the board.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/board/${id}`,
        {
          method: "DELETE",
        },
      );

      toast.success("Board deleted");
      fetchGroups();
      fetchBoards();
    } catch (err) {
      console.error("Error deleting board:", err);
      toast.error("Failed to delete board.");
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editingGroupId.trim()) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/board/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupId: Number(editingGroupId) }),
        },
      );

      toast.success("Board updated");
      setEditingId(null);
      setEditingGroupId("");
      fetchGroups();
      fetchBoards();
    } catch (err) {
      console.error("Error updating board:", err);
      toast.error("Failed to update board.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Announcement Boards</h1>

      <div className="flex w-fit gap-2 items-center">
        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select Group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((group) => (
              <SelectItem key={group.id} value={String(group.id)}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleCreate}
          disabled={!userId || !selectedGroupId || creating}
        >
          {creating ? "Creating..." : "Create Board"}
        </Button>
      </div>

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
