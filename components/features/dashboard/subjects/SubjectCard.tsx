import Link from "next/link";
import Image from "next/image";
import { SubjectType } from "@/types/Subject";
import { TeachersAvatars } from "@/components/shared/TeacherAvatars";
import logo from "@/app/favicon.ico";
import { Card } from "@/components/ui/card";

type Props = {
  subject: SubjectType;
  schoolId: string;
};

export default function SubjectCard({ subject, schoolId }: Props) {
  const imageSrc =
    subject.imageUrl && subject.imageUrl.trim() !== ""
      ? subject.imageUrl
      : logo;

  return (
    <Link href={`/school/${schoolId}/subjects/${subject.id}`}>
      <Card className="group cursor-pointer transform-gpu transition-transform duration-500 ease-in-out">
        <div className="relative h-full w-full rounded-2xl shadow-md transition-all duration-300 group-hover:scale-[1.05] group-hover:shadow-2xl group-hover:-rotate-x-2 group-hover:rotate-y-2">
          <div className="relative h-[150px] w-full overflow-hidden rounded-t-2xl">
            <Image
              src={imageSrc}
              alt={subject.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="flex h-24 flex-col justify-start rounded-b-2xl  p-3 text-white">
            <h2 className="text-lg text-accent-foreground font-bold">
              {subject.name}
            </h2>
            <TeachersAvatars teachers={subject.teachers} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
