"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import UserAttendancePieChart from "./PieChart";
import ExamTimetable from "./ExamTimetable";
import Leaderboard from "./Leaderboard";
import GroupMembersPage from "./member";

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

interface Attendance {
  id: number;
  userId: number;
  status: string;
  date: string;
}

interface Subject {
  id: number;
  name: string;
  imageUrl?: string | null;
}

interface ExamEntry {
  id: number;
  subjectId: number;
  date: string;
  session: string;
  time: string;
  maxMarks: number;
  minMarks: number;
  subject: Subject;
}

interface Exam {
  id: number;
  name: string;
  batch: string;
  groupId: number;
  entries: ExamEntry[];
}

export default function GroupDetailsPage() {
  const { id: schoolId, groupId, userId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [boards, setBoards] = useState<AnnouncementBoard[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("announcements");

  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/school/${schoolId}/group/${groupId}`,
        );
        const data = await res.json();
        setGroup(data);
      } catch (err) {
        console.error("Error fetching group:", err);
      }
    }

    async function fetchBoardsWithMessages() {
      try {
        const res = await fetch(
          "${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/boards",
        );
        const boardsData = await res.json();
        if (!Array.isArray(boardsData))
          throw new Error("Invalid boards response");

        const groupBoards = boardsData.filter(
          (b) => b.groupId === Number(groupId),
        );
        const boardsWithMessages: AnnouncementBoard[] = await Promise.all(
          groupBoards.map(async (board) => {
            const msgRes = await fetch(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/announcements/board/${board.id}/messages`,
            );
            const messages = await msgRes.json();
            return { ...board, messages };
          }),
        );
        setBoards(boardsWithMessages);
      } catch (error) {
        console.error("Error fetching boards or messages:", error);
      }
    }

    async function fetchAttendances() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/markattendance/${groupId}`,
        );
        const data = await res.json();
        if (!Array.isArray(data))
          throw new Error("Invalid attendance response");
        setAttendances(data);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    }

    async function fetchExams() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/exams`,
        );
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid exams response");
        const groupExams = data.filter(
          (exam) => exam.groupId === Number(groupId),
        );
        setExams(groupExams);
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
    }

    async function fetchAll() {
      setLoading(true);
      try {
        await Promise.all([
          fetchGroup(),
          fetchBoardsWithMessages(),
          fetchAttendances(),
          fetchExams(),
        ]);
      } finally {
        setLoading(false);
      }
    }

    if (schoolId && groupId) {
      fetchAll();
    }
  }, [schoolId, groupId]);

  if (loading) return <p className="p-6 text-gray-500"></p>;
  if (!group) return <p className="p-6 text-red-500">Group not found.</p>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-900 p-6 rounded-lg shadow text-white">
        <h2 className="text-3xl font-bold">{group.name}</h2>
        <p className="text-sm opacity-90 mt-1">Group ID: {group.id}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        {[
          "announcements",
          "attendance",
          "leaderboard",
          "timetable",
          "members",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === tab
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-gray-500"
            }`}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "announcements" && (
        <div>
          <h3 className="text-xl font-semibold text-gray-700">
            📢 Announcements
          </h3>
          {boards.length === 0 ? (
            <p className="text-gray-500 italic">No boards found.</p>
          ) : (
            boards.map((board) => (
              <div
                key={board.id}
                className="bg-white border rounded-lg shadow hover:shadow-md transition p-4 mt-4"
              >
                <p className="text-sm text-gray-400 mb-2">
                  Board ID: {board.id}
                </p>
                {board.messages.length === 0 ? (
                  <p className="italic text-gray-500">
                    No messages in this board.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {board.messages.map((msg) => (
                      <li
                        key={msg.id}
                        className="bg-gray-50 border rounded p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {msg.createdBy.avatarUrl ? (
                            <Image
                              src={msg.createdBy.avatarUrl}
                              alt={msg.createdBy.fullName}
                              width={30}
                              height={30}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded-full" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {msg.createdBy.fullName}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 whitespace-pre-line">
                          {msg.content}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "attendance" && (
        <div className=" p-4 ">
          <h4 className="text-lg mb-4 font-semibold">🛠️ Attendance Insights</h4>
          {attendances.length > 0 ? (
            <UserAttendancePieChart
              userId={Number(userId)}
              attendances={attendances}
            />
          ) : (
            <p className="text-gray-500 italic">No attendance data.</p>
          )}
        </div>
      )}

      {activeTab === "leaderboard" && (
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            🏆 Leaderboard
          </h4>
          {exams.length > 0 ? (
            <Leaderboard
              examId={exams[0]?.id}
              schoolId={schoolId as string}
              groupId={groupId as string}
            />
          ) : (
            <p className="text-gray-500 italic">No exams for leaderboard.</p>
          )}
        </div>
      )}

      {activeTab === "timetable" && (
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            📚 Exam Timetable
          </h4>
          {exams.length > 0 ? (
            <ExamTimetable
              exams={exams.map((e) => ({
                ...e,
                group: {
                  id: group.id,
                  name: group.name,
                },
                entries: e.entries.map((entry) => ({
                  ...entry,
                  examId: e.id,
                  subject: {
                    ...entry.subject,
                    imageUrl: entry.subject.imageUrl ?? null,
                  },
                })),
              }))}
            />
          ) : (
            <p className="text-gray-500 italic">No exams available.</p>
          )}
        </div>
      )}

      {activeTab === "members" && (
        <div className=" p-4 ">
          <h4 className="text-lg mb-4 font-semibold">🫂 Members</h4>
          {attendances.length > 0 ? (
            <GroupMembersPage />
          ) : (
            <p className="text-gray-500 italic">No members data.</p>
          )}
        </div>
      )}
    </div>
  );
}
