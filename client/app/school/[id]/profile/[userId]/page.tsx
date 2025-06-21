/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { cookies } from "next/headers";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import logo from "@/app/favicon.ico";

import React from "react";
import QRCodeBox from "./QRCodeBox";
import MarkRadarAndTable from "./RadarChart";
import MarkRadarForExam from "./MarkRadarForExam";
import axios from "@/lib/axiosInstance";

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
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/exams/user/${userId}`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.exams as Exam[];
}

// ✅ Fetch school (conditionally if authorized)
async function getSchoolIfAuthorized(schoolId: string) {
  try {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) return null;

    const res = await axios.get(`/school/${schoolId}`, {
      headers: { Authorization: token },
    });

    return res.data;
  } catch (err: any) {
    console.error(err?.response?.data || "School fetch failed");
    return null;
  }
}

interface ProfilePageProps {
  params: { id: string; userId: string };
}

export default async function Profile({ params }: ProfilePageProps) {
  const { id: schoolId, userId } = params;

  let user: any = null;
  let school: any = null;
  let exams: Exam[] = [];

  try {
    [user, school, exams] = await Promise.all([
      getUserById(schoolId, userId),
      getSchoolIfAuthorized(schoolId),
      getExamsByUserId(userId),
    ]);
  } catch (err) {
    console.error("Error fetching profile data:", err);
  }

  const userSchool = user?.schools?.[0];
  const rollNumber = userSchool?.rollNumber;
  const today = format(new Date(), "EEE d MMMM yyyy");
  const isStudent = user?.role === "STUDENT";

  return (
    <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      {/* Profile Header */}
      {user && (
        <>
          {/* Mobile View: Avatar & QR in Tabs */}
          <div className="md:hidden mt-4">
            <Tabs defaultValue="avatar" className="w-full">
              <TabsList className="w-full bg-primary/10 p-1 rounded-xl flex justify-around">
                <TabsTrigger
                  value="avatar"
                  className="flex-1 text-center py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 text-sm font-medium"
                >
                  🧑 Avatar
                </TabsTrigger>
                <TabsTrigger
                  value="qr"
                  className="flex-1 text-center py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 text-sm font-medium"
                >
                  🔳 QR
                </TabsTrigger>
              </TabsList>

              {/* Avatar Content */}
              <TabsContent
                value="avatar"
                className="flex flex-col items-center gap-4 mt-4"
              >
                <Avatar className="h-28 w-28 shadow-md border-2 border-primary">
                  <AvatarImage
                    src={user?.avatarUrl || ""}
                    alt={user?.fullName || "User"}
                  />
                  <AvatarFallback className="text-2xl">
                    {user?.fullName?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center space-y-1 px-2">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Hi, {user?.fullName ?? "User"} 👋
                  </h1>
                  <p className="text-gray-600 text-base">
                    <span className="font-semibold">Roll Number:</span>{" "}
                    {rollNumber ?? "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.email ?? "No Email"}
                  </p>
                  <p className="text-sm text-gray-500">
                    User ID: {user?.id ?? "N/A"}
                  </p>
                  {user?.role && (
                    <Badge className="capitalize bg-primary text-white px-2 py-1">
                      {user.role}
                    </Badge>
                  )}
                  <p className="text-sm text-gray-500">Today: {today}</p>
                </div>
              </TabsContent>

              {/* QR Code Content */}
              <TabsContent
                value="qr"
                className=" flex flex-col items-center gap-4 mt-10 "
              >
                <QRCodeBox
                  value={`${process.env.NEXT_PUBLIC_BASE_URL}/school/${schoolId}/profile/${user.id}`}
                  logoUrl={logo.src}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop View: Avatar + Info + QR */}
          <div className="hidden md:flex flex-row items-start justify-between gap-8 mt-4">
            {/* Left Section: Avatar + Info */}
            <div className="flex gap-6 items-center">
              <Avatar className="h-40 w-40 border-2 border-primary shadow-md">
                <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                <AvatarFallback className="text-2xl">
                  {user?.fullName?.charAt(0) ?? "U"}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <h1 className="text-3xl font-bold text-gray-800">
                  Hi, {user?.fullName ?? "User"} 👋
                </h1>
                <p className="text-gray-600 text-base">
                  <span className="font-semibold">Roll Number:</span>{" "}
                  {rollNumber ?? "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.email ?? "No Email"}
                </p>
                <p className="text-sm text-gray-500">
                  User ID: {user?.id ?? "N/A"}
                </p>
                <Badge className="capitalize bg-primary text-white px-2 py-1">
                  {user?.role}
                </Badge>
                <p className="text-sm text-gray-500">Today: {today}</p>
              </div>
            </div>

            {/* Right Section: QR Code */}
            <div className="flex-shrink-0">
              <QRCodeBox
                value={`${process.env.NEXT_PUBLIC_BASE_URL}/school/${schoolId}/profile/${user.id}`}
                logoUrl={logo.src}
              />
            </div>
          </div>
        </>
      )}

      {/* Tabs */}
      {isStudent ? (
        <Tabs defaultValue="subject" className="mt-12 w-full">
          <TabsList className="bg-primary/10 p-1 rounded-xl flex gap-2">
            <TabsTrigger
              value="subject"
              className="flex-1 py-2 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 text-sm font-medium"
            >
              📚 Subject-wise
            </TabsTrigger>
            <TabsTrigger
              value="exam"
              className="flex-1 py-2 px-4 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 text-sm font-medium"
            >
              📝 Exam-wise
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subject" className="mt-6">
            <MarkRadarAndTable user={user} />
          </TabsContent>

          <TabsContent value="exam" className="mt-6">
            {exams.length === 0 ? (
              <div className="text-center text-gray-500 mt-6">
                No exams found for this user.
              </div>
            ) : (
              <div className="mt-6 space-y-10">
                {exams.map((exam) => (
                  <React.Fragment key={exam.id}>
                    <MarkRadarForExam user={user} />
                  </React.Fragment>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="mt-10 text-center text-gray-500">
          {user
            ? "This user does not have permission to view exam results."
            : "User information is unavailable or restricted."}
        </div>
      )}
    </div>
  );
}
