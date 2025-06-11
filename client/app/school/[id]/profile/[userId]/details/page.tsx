// No "use client" here

import CreateProfileClient from "./createdetails";


interface PageProps {
    params: {
      id: string;
      userId: string;
    };
  }

export default async function CreateProfile({ params }: PageProps) {
    const resolvedParams = await params;  // await here
    const userId = Number(resolvedParams.userId);

  // You can fetch user/school data here if needed
  // const user = await getUser(...)
  // const school = await getSchool(...)

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Create Profile</h1>
      <CreateProfileClient  schoolId={params.id} userId={userId} />
    </main>
  );
}
