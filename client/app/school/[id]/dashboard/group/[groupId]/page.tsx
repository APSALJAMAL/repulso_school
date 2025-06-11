import GroupPageClient from "./grouppage";

interface Props {
  params: {
    id: string;
    groupId: string;
  };
}

// ✅ Make the component async
const GroupPage = async ({ params }: Props) => {
  const { id, groupId } = params;

  return <GroupPageClient id={id} groupId={groupId} />;
};

export default GroupPage;
