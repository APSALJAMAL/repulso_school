"use client";

import Link from "next/link";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import {
  Home,
  Settings,
  LibraryBig,
  Podcast,
  BookCheck,
  DatabaseZap,
  TicketCheck,
  Boxes,
} from "lucide-react";

import { SchoolSwitcher } from "@/components/features/dashboard/SchoolSwitcher";
import { NavUser } from "@/components/features/dashboard/NavUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Navlogo } from "./NavLogo";

type Props = {
  activeSchoolId: string;
  userRole: string;
};

const tabs = [
  {
    title: "Home",
    url: "dashboard",
    icon: Home,
  },
  {
    title: "Subjects",
    url: "dashboard/subjects",
    icon: LibraryBig,
  },
  {
    title: "Groups",
    url: "dashboard/group",
    icon: Boxes,
  },
  {
    title: "Announcement",
    url: "dashboard/group/announcements",
    icon: Podcast,
  },
  {
    title: "Exam",
    url: "dashboard/exams",
    icon: BookCheck,
  },
  {
    title: "Field",
    url: "dashboard/custom-fields",
    icon: TicketCheck,
    roles: ["super_admin"], // ⛔ only for SUPER_ADMIN
  },
  {
    title: "Database",
    url: "dashboard/custom-fields/database",
    icon: DatabaseZap,
    roles: ["super_admin"], // ⛔ only for SUPER_ADMIN
  },
  {
    title: "Settings",
    url: "dashboard/settings",
    icon: Settings,
    roles: ["super_admin"],
  },
];

export function AppSidebar({ activeSchoolId, userRole }: Props) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Navlogo />
        <SchoolSwitcher activeSchoolId={activeSchoolId} />
      </SidebarHeader>

      <SidebarContent className="justify-between">
        <SidebarGroup>
          <SidebarMenu>
            {tabs
              .filter((tab) => !tab.roles || tab.roles.includes(userRole))
              .map((tab) => {
                const isActive =
                  pathname === `/school/${activeSchoolId}/${tab.url}`;
                return (
                  <Link
                    key={tab.title}
                    href={`/school/${activeSchoolId}/${tab.url}`}
                  >
                    <SidebarMenuItem key={tab.title}>
                      <SidebarMenuButton
                        className={clsx({
                          "bg-primary text-white duration-150": isActive,
                        })}
                        tooltip={tab.title}
                      >
                        {tab.icon && <tab.icon />}
                        <span>{tab.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                );
              })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <NavUser SchoolId={activeSchoolId} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
