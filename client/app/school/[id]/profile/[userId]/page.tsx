import { getSchool } from "@/fetches/school";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/shared/Navbar";
import QRCodeBox from "./QRCodeBox";
import logo from "@/app/favicon.ico";
import MarkRadarChart from "./RadarChart";
import PieChartExample from "./PieChart";

import { Pen } from "lucide-react";
import { Button } from "@/components/ui/button";

// ✅ Fetch user by ID
async function getUserById(schoolId: string, userId: string) {
  const res = await fetch(
    `http://localhost:5555/api/school/${schoolId}/users/${userId}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  return await res.json();
}

interface ProfilePageProps {
  params: { id: string; userId: string };
}

export default async function Profile({ params }: ProfilePageProps) {
  const { id: schoolId, userId } = params;

  const [user, school] = await Promise.all([
    getUserById(schoolId, userId),
    getSchool(schoolId),
  ]);

  const today = format(new Date(), "EEE d MMMM yyyy");

  if (!user) return <div>User not found</div>;
  if (!school) return <div>School not found</div>;

  // Assuming current logged-in user is same as `user` in this context
  const isOwner = user.id === userId;

  return (
    <>
      <Navbar schoolId={schoolId} user={user} />

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
              {isOwner && (
                <Button
                  onClick={() =>
                    window.location.assign(
                      `/school/${schoolId}/profile/${user.id}/details`,
                    )
                  }
                  className="bg-primary absolute -right-2 -bottom-2 h-8 w-8 rounded-full p-2 hover:bg-blue-700"
                >
                  <Pen className="h-4 w-4 text-white" />
                </Button>
              )}
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

        {/* Radar Chart */}
        <MarkRadarChart user={user} />

        {/* Pie Chart */}
        <PieChartExample />
      </div>
    </>
  );
}
