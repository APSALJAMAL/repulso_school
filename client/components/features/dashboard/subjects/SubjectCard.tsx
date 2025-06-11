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
      <Card>
        <Image
          src={imageSrc}
          alt={subject.name}
          width={200}
          height={150}
          className="h-[150px] w-full rounded-t-lg object-cover"
        />
        <div className="flex h-20 flex-col justify-start">
          <h2 className="mt-3 px-2 font-semibold">{subject.name}</h2>
          <TeachersAvatars teachers={subject.teachers} />
        </div>
      </Card>
    </Link>
  );
}
