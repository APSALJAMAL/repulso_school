"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: number;
  content: string;
  createdAt: string;
  createdBy: {
    name: string;
  };
}

export default function BoardPage() {
  const { boardId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const userId = 1; // Replace with real auth logic

  const fetchMessages = async () => {
    const res = await fetch(
      `http://localhost:5555/api/announcements/board/${boardId}/messages`,
    );
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    fetchMessages();
  }, [boardId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    await fetch("http://localhost:5555/api/announcements/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boardId: Number(boardId),
        userId,
        content: newMessage,
      }),
    });

    setNewMessage("");
    fetchMessages();
  };

  const handleDelete = async (id: number) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this message?",
    );
    if (!confirm) return;

    await fetch(`http://localhost:5555/api/announcements/message/${id}`, {
      method: "DELETE",
    });

    fetchMessages();
  };

  const handleUpdate = async (id: number) => {
    if (!editContent.trim()) return;

    await fetch(`http://localhost:5555/api/announcements/message/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });

    setEditId(null);
    setEditContent("");
    fetchMessages();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Board #{boardId}</h1>

      <div className="space-y-2">
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
                  <p>{msg.content}</p>
                  <small className="text-xs text-gray-500">
                    by {msg.createdBy?.name ?? "Unknown"} on{" "}
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

      <div className="pt-4 space-y-2">
        <Textarea
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}
