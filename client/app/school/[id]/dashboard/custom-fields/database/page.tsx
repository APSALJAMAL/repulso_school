/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { getCookie } from "cookies-next";
import axios from "@/lib/axiosInstance";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomField, CustomValue, User, Group } from "@/types/custom";

export default function CustomFieldTablePage() {
  const params = useParams();
  const schoolId = params?.id as string;

  const [users, setUsers] = useState<User[]>([]);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [values, setValues] = useState<CustomValue[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const getToken = async () => await getCookie("token");

  const fetchGroups = async () => {
    const token = await getToken();
    const res = await axios.get(`/school/${schoolId}/group`, {
      headers: { Authorization: token },
    });
    setGroups(res.data || []);
  };

  const fetchUsers = async (): Promise<User[]> => {
    const token = await getToken();

    const url =
      selectedGroup === "all"
        ? `/school/${schoolId}/allschoolmember`
        : `/school/${schoolId}/group/${selectedGroup}`;

    const res = await axios.get(url, {
      headers: { Authorization: token },
    });

    let rawUsers = Array.isArray(res.data)
      ? res.data
      : res.data?.members || res.data?.users || [];

    if (!Array.isArray(rawUsers)) {
      console.error("❌ Unexpected users API response:", res.data);
      return [];
    }

    // Manually attach group if missing
    if (selectedGroup !== "all" && res.data?.id && res.data?.name) {
      const group = { id: res.data.id, name: res.data.name };
      rawUsers = rawUsers.map((user) => ({
        ...user,
        groups: user.groups ?? [group],
      }));
    }

    return selectedRole === "all"
      ? rawUsers
      : rawUsers.filter((user: { role: string }) => user.role === selectedRole);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const [usersRes, fieldsRes, valuesRes] = await Promise.all([
        fetchUsers(),
        axios.get("/fields", { headers: { Authorization: token } }),
        axios.get("/values", { headers: { Authorization: token } }),
      ]);

      setUsers(usersRes);
      setFields(fieldsRes.data || []);
      setValues(valuesRes.data || []);
    } catch (error) {
      console.error("❌ Data loading failed:", error);
    } finally {
      setLoading(false);
    }
  }, [schoolId, selectedGroup, selectedRole]);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedGroup, selectedRole]);

  const getValue = (userId: number, fieldId: number) =>
    values.find((v) => v.userId === userId && v.fieldId === fieldId)?.value ??
    "";

  const handleSave = async (userId: number, fieldId: number, value: string) => {
    const token = await getToken();
    try {
      console.log("🔼 Saving:", { userId, fieldId, value });

      await axios.post(
        "/values",
        { userId, fieldId, value },
        { headers: { Authorization: token } },
      );
    } catch (err) {
      console.error("❌ Failed to save value:", err);
    }
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="text-2xl">Database View</CardTitle>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Select
                value={selectedGroup}
                onValueChange={(val) => setSelectedGroup(val)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={String(group.id)}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedRole}
                onValueChange={(val) => setSelectedRole(val)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-auto">
          {loading ? (
            <>
              <Skeleton className="h-8 w-1/4 mb-4" />
              <Skeleton className="h-80 w-full" />
            </>
          ) : (
            <table className="min-w-full table-auto border border-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="border px-4 py-2">ID</th>
                  <th className="border px-4 py-2">Full Name</th>
                  <th className="border px-4 py-2">Email</th>
                  <th className="border px-4 py-2">Role</th>
                  <th className="border px-4 py-2">Photo</th>
                  <th className="border px-4 py-2">Groups</th>
                  {fields.map((field) => (
                    <th key={field.id} className="border px-4 py-2 text-left">
                      <div className="flex flex-col">
                        <span className="font-medium">{field.label}</span>
                        <span className="text-xs text-gray-500">
                          {field.type}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="even:bg-gray-50">
                    <td className="border px-4 py-2">{user.id}</td>
                    <td className="border px-4 py-2">{user.fullName}</td>
                    <td className="border px-4 py-2">{user.email}</td>
                    <td className="border px-4 py-2">{user.role}</td>
                    <td className="border px-4 py-2">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt="avatar"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="border px-4 py-2">
                      {Array.isArray(user.groups)
                        ? user.groups.map((g) => g.name).join(", ") || "N/A"
                        : "N/A"}
                    </td>
                    {fields.map((field) => {
                      const currentValue = getValue(user.id, field.id);
                      return (
                        <td key={field.id} className="border px-2 py-1">
                          <Input
                            defaultValue={currentValue}
                            onChange={(e) =>
                              handleSave(user.id, field.id, e.target.value)
                            }
                            className="h-8 text-sm"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
