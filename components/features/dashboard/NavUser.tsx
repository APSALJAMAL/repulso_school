"use client";

import { ChevronsUpDown, CircleUserRound, LogOut } from "lucide-react";
import { deleteCookie } from "cookies-next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { UserType } from "@/types/User";
import { getInitials } from "@/lib/utils";
import { getUser } from "@/fetches/user";
import { Skeleton } from "@/components/ui/skeleton";
type NavUserProps = {
  SchoolId: string;
};
export function NavUser({ SchoolId }: NavUserProps) {
  const { data: user, isLoading } = useQuery<UserType>({
    queryKey: ["user"],
    queryFn: getUser,
  });
  const router = useRouter();
  const { isMobile } = useSidebar();
  const handleProfileClick = () => {
    if (user && SchoolId) {
      router.push(`/school/${SchoolId}/profile/${user.id}/details`);
    } else {
      console.error("User ID or School ID missing.");
    }
  };

  if (isLoading) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-2 w-32" />
              <Skeleton className="h-2 w-20" />
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!user) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                <AvatarFallback className="rounded-lg">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.fullName}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user.fullName}
                  </span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleProfileClick}>
              <CircleUserRound className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                deleteCookie("token");
                router.push("/sign-in");
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
