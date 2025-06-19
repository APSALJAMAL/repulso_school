"use client";

import { GroupType } from "@/types/Group";
import { MemberType } from "@/types/member";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DeleteGroup from "@/components/features/dashboard/groups/DeleteGroup";
import EditGroup from "@/components/features/dashboard/groups/EditGroup";
import GroupDetails from "@/components/features/dashboard/groups/GroupDetails";
import Link from "next/link";

type Props = {
  group: GroupType;
  data: MemberType[];
  schoolId: string;
  groups: GroupType[];
  level?: number; // for indentation
};

export default function GroupItem({
  group,
  data,
  schoolId,
  groups,
  level = 0,
}: Props) {
  const hasChildren = group.children && group.children.length > 0;

  return (
    <div
      className={
        "group relative mb-4 rounded-lg border bg-white p-4 shadow transition hover:bg-primary/5 dark:bg-neutral-900"
      }
      style={{ marginLeft: level * 20 }}
    >
      {/* Group Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Users className="text-primary size-4" />
          <span className="font-semibold">
            <Link
              href={`/school/${schoolId}/dashboard/group/${group.id}`}
              className="text-primary "
            >
              {group.name}
            </Link>
          </span>

          <Badge variant="outline" className="text-sm">
            <Users className="text-primary" />
            {group._count.members} member(s)
          </Badge>
          <Badge variant="default" className="text-sm">
            GroupId {group.id}
          </Badge>
        </div>

        {/* Hover Actions */}
        <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition">
          <DeleteGroup schoolId={schoolId} group={group} />
          <EditGroup schoolId={schoolId} group={group} groups={groups} />
          <GroupDetails schoolId={schoolId} data={data} group={group} />
        </div>
      </div>

      {/* Child Groups */}
      {hasChildren && (
        <div className="mt-4 space-y-2">
          {group.children?.map((child) => (
            <GroupItem
              key={child.id}
              group={child}
              data={data}
              schoolId={schoolId}
              groups={groups}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
