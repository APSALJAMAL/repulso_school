"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/types/profile";

type Props = {
  schoolId: string;
  userId: number;
};

export default function CreateProfileClient({schoolId, userId }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<Profile>({
    userId,
    dateOfBirth: "",
    gender: "MALE",
    bloodType: "O_POS",
    phone: "",
    address: "",
    rollNumber: "",
    course: "",
    branch: "",
    year: 1,
    semester: 1,
    section: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "year" || name === "semester" ? Number(value) : value,
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (
      !form.rollNumber ||
      !form.phone ||
      !form.address ||
      !form.dateOfBirth ||
      !form.course ||
      !form.branch ||
      !form.section
    ) {
      alert("Please fill in all required fields.");
      return;
    }
  
    console.log("Sending profile data:", form);
  
    const res = await fetch("http://localhost:5555/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        dateOfBirth: new Date(form.dateOfBirth).toISOString(), // 👈 ISO format
      }),
    });
  
    const data = await res.json();
    console.log("Response:", data);
  
    if (res.ok) {
      router.push(`/school/${schoolId}/profile/${userId}`);
    } else {
      alert(data.error || "Failed to create profile");
    }
  };
  

  return (
    <div className="max-w-md mx-auto p-4 border rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Create Student Profile</h2>

      <input
        name="rollNumber"
        placeholder="Roll Number"
        value={form.rollNumber}
        onChange={handleChange}
        className="border p-2 mb-2 block w-full"
      />
      <input
        name="dateOfBirth"
        type="date"
        value={form.dateOfBirth}
        onChange={handleChange}
        className="border p-2 mb-2 block w-full"
      />
      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        className="border p-2 mb-2 block w-full"
      />
      <input
        name="address"
        placeholder="Address"
        value={form.address}
        onChange={handleChange}
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
        placeholder="Course"
        value={form.course}
        onChange={handleChange}
        className="border p-2 mb-2 block w-full"
      />
      <input
        name="branch"
        placeholder="Branch"
        value={form.branch}
        onChange={handleChange}
        className="border p-2 mb-2 block w-full"
      />
      <input
        name="section"
        placeholder="Section"
        value={form.section}
        onChange={handleChange}
        className="border p-2 mb-2 block w-full"
      />
      <input
        name="year"
        type="number"
        placeholder="Year"
        value={form.year}
        onChange={handleChange}
        className="border p-2 mb-2 block w-full"
      />
      <input
        name="semester"
        type="number"
        placeholder="Semester"
        value={form.semester}
        onChange={handleChange}
        className="border p-2 mb-4 block w-full"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Create
      </button>
    </div>
  );
}
