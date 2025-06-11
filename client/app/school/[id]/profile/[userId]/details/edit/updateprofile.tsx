"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/types/profile";

type Props = {
  schoolId: string;
  userId: string;
};

export default function UpdateDeleteProfileClient({ schoolId, userId }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Profile | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5555/api/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => setForm(data))
      .catch(() => setForm(null));
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!form) return;
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "year" || name === "semester" ? Number(value) : value,
    });
  };

  const handleUpdate = async () => {
    if (!form) return;

    if (!form.rollNumber || !form.dateOfBirth || !form.phone) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      ...form,
      dateOfBirth: new Date(form.dateOfBirth).toISOString(),
    };

    const res = await fetch(`http://localhost:5555/api/profile/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok) {
      router.push(`/school/${schoolId}/profile/${userId}`);
    } else {
      alert(data.error || "Update failed");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this profile?")) return;

    const res = await fetch(`http://localhost:5555/api/profile/${userId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.push(`/school/${schoolId}/profile/${userId}`);
    } else {
      const data = await res.json();
      alert(data.error || "Delete failed");
    }
  };

  if (!form) return <p>Loading profile...</p>;

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>

      <input
        name="rollNumber"
        value={form.rollNumber}
        onChange={handleChange}
        placeholder="Roll Number"
        className="border p-2 mb-2 block w-full"
      />

      <input
        name="dateOfBirth"
        type="date"
        value={form.dateOfBirth ? form.dateOfBirth.split("T")[0] : ""}
        onChange={handleChange}
        className="border p-2 mb-2 block w-full"
      />

      <input
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="Phone"
        className="border p-2 mb-2 block w-full"
      />
      <input
        name="address"
        value={form.address}
        onChange={handleChange}
        placeholder="Address"
        className="border p-2 mb-2 block w-full"
      />
      <select
        name="gender"
        value={form.gender}
        onChange={handleChange}
        className="border p-2 mb-2 block w-full"
      >
        <option value="MALE">Male</option>
        <option value="FEMALE">Female</option>
        <option value="OTHER">Other</option>
        <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
      </select>
      <select
        name="bloodType"
        value={form.bloodType}
        onChange={handleChange}
        className="border p-2 mb-2 block w-full"
      >
        <option value="A_POS">A+</option>
        <option value="A_NEG">A-</option>
        <option value="B_POS">B+</option>
        <option value="B_NEG">B-</option>
        <option value="AB_POS">AB+</option>
        <option value="AB_NEG">AB-</option>
        <option value="O_POS">O+</option>
        <option value="O_NEG">O-</option>
        <option value="UNKNOWN">Unknown</option>
      </select>
      <input
        name="course"
        value={form.course}
        onChange={handleChange}
        placeholder="Course"
        className="border p-2 mb-2 block w-full"
      />
      <input
        name="branch"
        value={form.branch}
        onChange={handleChange}
        placeholder="Branch"
        className="border p-2 mb-2 block w-full"
      />
      <input
        name="section"
        value={form.section}
        onChange={handleChange}
        placeholder="Section"
        className="border p-2 mb-2 block w-full"
      />
      <input
        name="year"
        type="number"
        value={form.year}
        onChange={handleChange}
        placeholder="Year"
        className="border p-2 mb-2 block w-full"
      />
      <input
        name="semester"
        type="number"
        value={form.semester}
        onChange={handleChange}
        placeholder="Semester"
        className="border p-2 mb-4 block w-full"
      />

      <div className="flex gap-4">
        <button
          onClick={handleUpdate}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Update Profile
        </button>

        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Profile
        </button>
      </div>
    </main>
  );
}
