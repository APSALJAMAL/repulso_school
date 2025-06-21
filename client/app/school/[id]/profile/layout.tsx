/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Home, Boxes, UserRound, FileUser } from "lucide-react";
import { getUser } from "@/fetches/user";
import { getCookie } from "cookies-next";
import Navbar from "@/components/shared/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
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
  <Link href={href} className="relative group flex items-center justify-center">
    <Icon className="w-5 h-5 text-gray-600 hover:text-primary" />
    <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-primary text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition">
      {label}
    </span>
  </Link>
);

export default function GroupLayoutClient({ children }: Props) {
  const params = useParams();
  const schoolId = params?.id as string;

  const [userId, setUserId] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getCookie("token");

      if (!token) {
        setLoading(false); // No token, user is not logged in
        return;
      }

      try {
        const currentUser = await getUser();
        if (currentUser?.id) {
          setUserId(currentUser.id);
          setUser(currentUser);
        }
      } catch (err) {
        console.error("User fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (!schoolId || loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="z-40 fixed top-0 left-0 right-0 bg-white shadow">
        <Navbar schoolId={schoolId} user={user} />
      </header>

      {/* Main layout below navbar */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
        <aside className="w-16 fixed left-0 top-16 pt-20 bottom-0 bg-white border-r shadow flex flex-col items-center py-6 space-y-6 z-30">
          <SidebarItem
            href={`/school/${schoolId}/home`}
            icon={Home}
            label="Home"
          />
          {userId && (
            <>
              <SidebarItem
                href={`/school/${schoolId}/profile/${userId}/details`}
                icon={FileUser}
                label="Details"
              />
              <SidebarItem
                href={`/school/${schoolId}/profile/${userId}`}
                icon={UserRound}
                label="User"
              />
              <SidebarItem
                href={`/school/${schoolId}/profile/${userId}/groups`}
                icon={Boxes}
                label="Groups"
              />
            </>
          )}
        </aside>

        {/* Page Content */}
        <main className="flex-1 ml-16 p-20 bg-gray-50 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
