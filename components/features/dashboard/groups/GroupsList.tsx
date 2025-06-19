"use client";

import { GroupType } from "@/types/Group";
import { MemberType } from "@/types/member";
import GroupItem from "@/components/features/dashboard/groups/GroupItem";

type Props = {
  groups: GroupType[];
  data: MemberType[];
  schoolId: string;
};

export default function GroupList({ groups, data, schoolId }: Props) {
  if (groups.length === 0) return <div>No groups yet</div>;

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <GroupItem
          key={group.id}
          data={data}
          schoolId={schoolId}
          group={group}
          groups={groups}
        />
      ))}
    </div>
  );
}
