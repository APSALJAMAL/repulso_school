import UpdateDeleteProfileClient from "./updateprofile";

type PageProps = {
  params: { id: string; userId: string };
};

export default async function Page({ params }: PageProps) {
  // Await params before destructuring or using
  const awaitedParams = await params;

  return (
    <UpdateDeleteProfileClient
      schoolId={awaitedParams.id}
      userId={awaitedParams.userId}
    />
  );
}
