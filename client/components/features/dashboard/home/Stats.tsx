import {
  Users,
  GraduationCap,
  LibraryBig,
  ShieldCheck,
  Shield,
  Boxes,
} from "lucide-react";
import { getSchool } from "@/fetches/school";
import { formatNumber } from "@/lib/utils";

type Props = {
  schoolId: string;
};
export default async function Stats({ schoolId }: Props) {
  const school = await getSchool(schoolId);

  const stats = [
    { title: "Total students", count: school._count.students, icon: Users },
    {
      title: "Total Teachers",
      count: school._count.teachers,
      icon: GraduationCap,
    },
    {
      title: "Total Admins",
      count: school._count.admins,
      icon: ShieldCheck,
    },
    {
      title: "Total Super Admins",
      count: school._count.superadmins,
      icon: Shield,
    },
    {
      title: "Total Subjects",
      count: school._count.subjects,
      icon: LibraryBig,
    },
    {
      title: "Total Groups",
      count: school._count.groups,
      icon: Boxes,
    },
  ];
  return (
    <section className="grid w-full gap-4 sm:grid-cols-2 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="flex flex-row items-start justify-between rounded-xl border p-4 shadow-md transition-transform duration-300 ease-in-out hover:shadow-xl hover:-translate-y-2 hover:scale-105 bg-white dark:bg-neutral-900"
        >
          <div>
            <div className="flex items-center text-sm font-semibold text-neutral-500">
              <h1 className="font-semibold">{stat.title}</h1>
            </div>
            <h1 className="mt-2 text-4xl font-bold">
              {formatNumber(stat.count)}
            </h1>
          </div>
          <div className="rounded-lg border p-2 bg-primary-100 dark:bg-primary-900">
            <stat.icon className="text-primary-700 size-6 dark:text-primary-300" />
          </div>
        </div>
      ))}
    </section>
  );
}
