import Link from "next/link";
import { ReactNode } from "react";
import { Home, Users, Settings } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  params: { id: string; groupId: string };
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
    <span className="absolute left-12 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition">
      {label}
    </span>
  </Link>
);

export default function GroupLayout({ children, params }: LayoutProps) {
  const { id, groupId } = params;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-16 bg-white shadow-md flex flex-col items-center py-4 space-y-6 border-r">
        <SidebarItem
          href={`/school/${id}/dashboard`}
          icon={Home}
          label="Members"
        />
        <SidebarItem
          href={`/school/${id}/dashboard/group/${groupId}/markattendance`}
          icon={Users}
          label="Attendance"
        />
        <SidebarItem
          href={`/school/${id}/dashboard/group/${groupId}/timetable`}
          icon={Settings}
          label="Timetable"
        />
      </aside>

      {/* Page content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
