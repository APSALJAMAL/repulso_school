import { Profile } from "@/types/profile";
import Link from "next/link";

async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const res = await fetch(`http://localhost:5555/api/profile/${userId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}

type UserProfileProps = {
  userId: string;
  schoolId: string;  // added
};

export default async function UserProfile({ userId, schoolId }: UserProfileProps) {
  const profile = await getProfile(userId);

  if (!profile) return <p className="text-red-500">Profile not found.</p>;

  return (
    <div className="mt-10 p-4 border rounded shadow-sm">
      <h2 className="text-xl font-semibold mb-4">
        Student Profile: {profile.rollNumber}
      </h2>
      <ul className="space-y-2">
        <li>Date of Birth: {profile.dateOfBirth}</li>
        <li>Gender: {profile.gender}</li>
        <li>Blood Type: {profile.bloodType}</li>
        <li>Phone: {profile.phone}</li>
        <li>Address: {profile.address}</li>
        <li>Course: {profile.course}</li>
        <li>Branch: {profile.branch}</li>
        <li>Year: {profile.year}</li>
        <li>Semester: {profile.semester}</li>
        <li>Section: {profile.section}</li>
      </ul>

      <Link
        href={`/school/${schoolId}/profile/${profile.userId}/details/edit`}
        className="inline-block mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Edit Profile
      </Link>
    </div>
  );
}
