import { getSchool } from "@/fetches/school";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import QRCodeBox from "./QRCodeBox";
import logo from "@/app/favicon.ico";
import MarkRadarChart from "./RadarChart";

import MarkRadarForExam from "./MarkRadarForExam";
import React from "react";

type Exam = {
  id: number;
  name: string;
  batch: string | null;
  groupId: number;
};

// ✅ Fetch user by ID
async function getUserById(schoolId: string, userId: string) {
  const res = await fetch(
    `http://localhost:5555/api/school/${schoolId}/users/${userId}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  return await res.json();
}

// ✅ Fetch exams by user ID
async function getExamsByUserId(userId: string) {
  const res = await fetch(`http://localhost:5555/api/exams/user/${userId}`, {
    cache: "no-store",
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.exams as Exam[];
}

interface ProfilePageProps {
  params: { id: string; userId: string };
}

export default async function Profile({ params }: ProfilePageProps) {
  const { id: schoolId, userId } = params;

  const [user, school, exams] = await Promise.all([
    getUserById(schoolId, userId),
    getSchool(schoolId),
    getExamsByUserId(userId),
  ]);

  const today = format(new Date(), "EEE d MMMM yyyy");

  if (!user) return <div>User not found</div>;
  if (!school) return <div>School not found</div>;

  return (
    <>
      <div className="relative mx-auto max-w-6xl p-8">
        {/* QR Code in top-right */}
        <div className="absolute top-8 right-8">
          <QRCodeBox
            value={`${process.env.NEXT_PUBLIC_BASE_URL}/school/${schoolId}/profile/${user.id}`}
            logoUrl={logo.src}
          />
        </div>

        {/* User Profile Info */}
        <div className="mt-16 mb-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20">
              <Avatar className="h-full w-full">
                <AvatarImage src={user.avatarUrl ?? ""} alt={user.fullName} />
                <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Hi, {user.fullName} 👋</h1>
              <p className="text-neutral-500">{user.email}</p>
              <p className="text-neutral-500">User Id : {user.id}</p>
              <Badge className="ml-2 capitalize">{user.role}</Badge>
              <div className="mt-4 text-neutral-500 md:mt-0">
                Today: {today}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Subject-Wise Radar Chart */}
        <MarkRadarChart user={user} />

        {/* ✅ Exam-Wise Radar Chart for each exam */}
        <div className="mt-12 space-y-10">
          {exams.length === 0 ? (
            <div className="text-center text-gray-500">
              No exams found for this user.
            </div>
          ) : (
            <div className="mt-12 space-y-10">
              {exams.map((exam) => (
                <React.Fragment key={exam.id}>
                  <MarkRadarForExam user={user} />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
