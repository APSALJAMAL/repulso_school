import { Toaster } from "@/components/ui/sonner";
import { getSchool } from "@/fetches/school";
import { redirect } from "next/navigation";

interface DashboardLayoutProps {
  params: { id: string };
  children: React.ReactNode;
}

export default async function DashboardLayout({
  params,
  children,
}: DashboardLayoutProps) {
  const activeSchoolId = params.id;

  const school = await getSchool(activeSchoolId);
  const role = school?.members?.[0]?.role?.toUpperCase();

  if (role !== "SUPER_ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Optional header can be added here */}
      {children}
      <Toaster />
    </div>
  );
}
