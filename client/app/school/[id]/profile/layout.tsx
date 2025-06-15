"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { Home, Users, Settings } from "lucide-react";
import { getUser } from "@/fetches/user";

interface Props {
  schoolId: string;
  groupId: string;
  children: ReactNode;
}

const SidebarItem = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Home;
  label: string;
}) => (
  <Link href={href} className="relative group">
    <Icon className="w-5 h-5 text-gray-600 hover:text-primary" />
    <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-primary text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition">
      {label}
    </span>
  </Link>
);

export default function GroupLayoutClient({
  children,
  schoolId,
  groupId,
}: Props) {
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const user = await getUser();
      if (user?.id) setUserId(user.id);
    };
    fetchUserId();
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-16 shadow-md flex flex-col items-center py-4 space-y-6 border-r">
        <SidebarItem
          href={`/school/${schoolId}/home`}
          icon={Home}
          label="Home"
        />
        <SidebarItem
          href={`/school/${schoolId}/dashboard/group/${groupId}/markattendance`}
          icon={Users}
          label="Attendance"
        />
        {userId && (
          <>
            <SidebarItem
              href={`/school/${schoolId}/profile/${userId}/details`}
              icon={Settings}
              label="Details"
            />
            <SidebarItem
              href={`/school/${schoolId}/profile/${userId}`}
              icon={Settings}
              label="Profile"
            />
            <SidebarItem
              href={`/school/${schoolId}/profile/${userId}/groups`}
              icon={Settings}
              label="Groups"
            />
          </>
        )}
      </aside>

      {/* Page content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
