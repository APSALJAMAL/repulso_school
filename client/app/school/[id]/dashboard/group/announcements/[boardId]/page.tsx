/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getCookie } from "cookies-next";
interface Message {
  id: number;
  content: string;
  createdAt: string;
  createdBy: {
    fullName: string;
  };
}

export default function BoardPage() {
  const { boardId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  // Get current user ID
  const fetchUser = async () => {
    const token = await getCookie("token");
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/me`, {
      headers: { Authorization: token as string },
    });
    const data = await res.json();
    setUserId(data.id);
  };

  // Get all messages
  const fetchMessages = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/board/${boardId}/messages`,
    );
    const data = await res.json();
    setMessages(data.reverse()); // show newest first
  };

  useEffect(() => {
    fetchUser();
    fetchMessages();
  }, [boardId]);

  // Send new message
  const handleSend = async () => {
    if (!newMessage.trim() || !userId) return;

    setSending(true);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/message`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boardId: Number(boardId),
          userId,
          content: newMessage,
        }),
      },
    );

    const saved = await res.json();
    setMessages((prev) => [saved, ...prev]); // add to top
    setNewMessage("");
    setSending(false);
  };

  // Delete message
  const handleDelete = async (id: number) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this message?",
    );
    if (!confirm) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/message/${id}`,
      {
        method: "DELETE",
      },
    );

    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  // Update message
  const handleUpdate = async (id: number) => {
    if (!editContent.trim()) return;

    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/message/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      },
    );

    setEditId(null);
    setEditContent("");
    fetchMessages();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Board #{boardId}</h1>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left: New Message */}
        <div className="w-full md:w-1/3 space-y-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[90px]"
          />
          <Button onClick={handleSend} disabled={sending} className="w-full">
            {sending ? "Sending..." : "Send"}
          </Button>
        </div>

        {/* Right: All Messages */}
        <div className="w-full md:w-2/3 space-y-2 max-h-[600px] overflow-y-auto pr-2">
          {messages.map((msg) => (
            <Card key={msg.id}>
              <CardContent className="p-4 space-y-2">
                {editId === msg.id ? (
                  <>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleUpdate(msg.id)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="whitespace-pre-line">{msg.content}</p>
                    <small className="text-xs text-gray-500">
                      by {msg.createdBy?.fullName ?? "Unknown"} on{" "}
                      {new Date(msg.createdAt).toLocaleString()}
                    </small>
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setEditId(msg.id);
                          setEditContent(msg.content);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(msg.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
