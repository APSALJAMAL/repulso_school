/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { SubjectDetailType } from "@/types/Subject";
import AssignSubjectTable from "@/components/features/subject/AssignSubjectTable";

type Props = {
  schoolId: string;
  subject: SubjectDetailType;
};

export default function AddSubjectMembersModal({ schoolId, subject }: Props) {
  const [membersToAssign, setMembersToAssign] = useState<any[]>([]); // You can replace `any` with a proper `MemberType` if available
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = getCookie("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/school/${schoolId}/member`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch members");
        }

        const members = await res.json();

        const filtered = members.filter((member: any) => {
          return !subject.users.some((m) => m.id === member.id);
        });

        setMembersToAssign(filtered);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [schoolId, subject.users]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="md:ml-auto" size="sm">
          <Plus size={20} />
          New member(s)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[60rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-4">
            {subject.name}
          </DialogTitle>
        </DialogHeader>
        {!loading && (
          <AssignSubjectTable
            schoolId={schoolId}
            members={membersToAssign}
            subject={subject}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
