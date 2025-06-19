"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import logo from "@/app/favicon.ico";

export function Navlogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="flex items-center gap-3 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="size-8 rounded-lg overflow-hidden">
            <AvatarImage src={logo.src} alt="Logo" />
            <AvatarFallback className="rounded-lg text-xl font-bold bg-muted text-muted-foreground">
              R
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col justify-center leading-none">
            <span className="text-2xl  font-extrabold">REPULSO</span>
            <span className="text-primary text-sm tracking-wider">
              EDUCATION
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
