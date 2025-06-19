"use client";

import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials, getRoleRedirectPath } from "@/lib/utils";
import { LogOut, UserRound } from "lucide-react";
import { deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "@/lib/axiosInstance";
import { AxiosError } from "axios";
import { RoleType } from "@/types/Role";
import { SchoolUserType } from "@/types/SchoolUser";
import Image from "next/image";
import logo from "@/app/favicon.ico";

export type SchoolType = {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  members: { role: RoleType }[];
};

export async function getSchool(schoolId: string) {
  try {
    const token = await getCookie("token");
    const res = await axios.get(`/school/${schoolId}`, {
      headers: { Authorization: token },
    });
    return res.data;
  } catch (err) {
    const error = err as AxiosError;
    console.error(error.response?.data || "Unexpected error occurred");
    return null;
  }
}

type Props = {
  schoolId: string;
  user: SchoolUserType;
};

export default function Navbar({ schoolId, user }: Props) {
  const router = useRouter();

  const { data: school, isLoading: isSchoolLoading } = useQuery<SchoolType>({
    queryKey: ["school", schoolId],
    queryFn: () => getSchool(schoolId),
    enabled: !!schoolId,
  });

  const handleProfileClick = () => {
    if (user?.id) {
      router.push(`/school/${schoolId}/profile`);
    }
  };

  const handleSignOut = () => {
    deleteCookie("token");
    router.push("/sign-in");
  };

  return (
    <nav className="flex items-center justify-between border-b p-4 md:p-6">
      <div className="flex h-14 items-center gap-4 lg:h-[60px]">
        {isSchoolLoading || !school ? (
          <Skeleton className="size-12 rounded-full" />
        ) : (
          <>
            {/* App Logo */}

            <Image src={logo} alt="Logo" className="size-12" />
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-extrabold">REPULSO</span>
              <span className="text-primary text-sm tracking-wider">
                EDUCATION
              </span>
            </div>

            {/* Separator */}
            <span className="text-3xl text-gray-400 select-none">/</span>

            {/* School logo and name */}
            <Link
              href={`/school/${schoolId}/${getRoleRedirectPath(school?.members?.[0]?.role ?? "member")}`}
              className="flex items-center gap-2 font-semibold"
            >
              <Avatar className="size-12">
                <AvatarImage src={school.logoUrl} />
                <AvatarFallback>{getInitials(school.name)}</AvatarFallback>
              </Avatar>
              <h1 className="text-lg hover:underline">{school.name}</h1>
            </Link>
          </>
        )}
      </div>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="cursor-pointer">
            {!user ? (
              <Skeleton className="size-12 rounded-full" />
            ) : (
              <Avatar className="size-12 rounded-full">
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-56 rounded-lg"
          align="end"
          sideOffset={6}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-3 py-2 text-left text-sm">
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                <AvatarFallback>
                  {getInitials(user?.fullName ?? "")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.fullName}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleProfileClick}>
              <UserRound className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
