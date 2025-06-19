/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
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
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [modified, setModified] = useState<Record<string, string>>({});

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
      : res.data.members || res.data.users || [];

    if (selectedGroup !== "all" && res.data?.id && res.data?.name) {
      const group = { id: res.data.id, name: res.data.name };
      rawUsers = rawUsers.map((user: { groups: any }) => ({
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
      const userRes = await axios.get("/me", {
        headers: { Authorization: token },
      });
      const userId = userRes.data?.id;

      const [usersRes, valuesRes, fieldsRes] = await Promise.all([
        fetchUsers(),
        axios.get(`/values/school/${schoolId}`, {
          headers: { Authorization: token },
        }),
        axios.get(`/fields/school/${schoolId}`, {
          headers: { Authorization: token },
        }),
      ]);

      setUsers(usersRes);
      setFields(fieldsRes.data || []);
      setValues(valuesRes.data || []);
    } catch (error) {
      toast.error("❌ Failed to load data");
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

  const handleInputChange = (
    userId: number,
    fieldId: number,
    value: string,
    type: string,
  ) => {
    const key = `${userId}-${fieldId}`;
    if (!validateValue(value, type)) {
      toast.warning(`Invalid ${type.toLowerCase()} value`);
      return;
    }
    setModified((prev) => ({ ...prev, [key]: value }));
  };

  const validateValue = (value: string, type: string) => {
    switch (type) {
      case "NUMBER":
        return !isNaN(Number(value));
      case "BOOLEAN":
        return value === "true" || value === "false";
      case "DATE":
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  };

  const handleSaveAll = async () => {
    const token = await getToken();
    const entries = Object.entries(modified);
    try {
      await Promise.all(
        entries.map(([key, value]) => {
          const [userId, fieldId] = key.split("-").map(Number);
          return axios.post(
            "/values",
            { userId, fieldId, value },
            { headers: { Authorization: token } },
          );
        }),
      );
      toast.success("✅ All changes saved");
      setModified({});
      loadData();
    } catch (err) {
      toast.error("❌ Failed to save all values");
    }
  };

  const filteredUsers = users.filter((user) => {
    const baseMatch =
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const fieldMatch = fields.some((field) =>
      getValue(user.id, field.id).toLowerCase().includes(search.toLowerCase()),
    );

    return baseMatch || fieldMatch;
  });

  return (
    <div className="p-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <CardTitle className="text-2xl">Database View</CardTitle>
            <div className="flex gap-4 flex-col sm:flex-row">
              <Input
                placeholder="Search by name, email or field"
                className="w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
              <Button onClick={handleSaveAll}>Save All</Button>
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
            <div className="overflow-auto">
              <table className="  border border-gray-200 text-sm">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="border px-4 py-2 resize-x overflow-auto">
                      ID
                    </th>
                    <th className="border px-4 py-2 resize-x overflow-auto">
                      Full Name
                    </th>
                    <th className="border px-4 py-2 resize-x overflow-auto">
                      Roll Number
                    </th>
                    <th className="border px-4 py-2 resize-x overflow-auto">
                      Email
                    </th>
                    <th className="border px-4 py-2 resize-x overflow-auto">
                      Role
                    </th>
                    <th className="border px-4 py-2 resize-x overflow-auto">
                      Photo
                    </th>
                    <th className="border px-4 py-2 resize-x overflow-auto">
                      Groups
                    </th>
                    {fields.map((field) => (
                      <th
                        key={field.id}
                        className="border px-4 py-2 resize-x overflow-auto"
                      >
                        <div className="flex  flex-col">
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
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="even:bg-gray-50">
                      <td className="border px-4 py-2 resize-y">{user.id}</td>
                      <td className="border px-4 py-2 resize-y">
                        {user.fullName}
                      </td>
                      <td className="border px-4 py-2 resize-y">
                        {user.rollNumber || "N/A"}
                      </td>
                      <td className="border px-4 py-2 resize-y">
                        {user.email}
                      </td>
                      <td className="border px-4 py-2 resize-y">{user.role}</td>
                      <td className="border px-4 py-2 resize-y">
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
                      <td className="border px-4 py-2 resize-y">
                        {Array.isArray(user.groups)
                          ? user.groups.map((g) => g.name).join(", ") || "N/A"
                          : "N/A"}
                      </td>
                      {fields.map((field) => {
                        const currentValue = getValue(user.id, field.id);
                        return (
                          <td
                            key={`${user.id}-${field.id}`}
                            className="border px-2 py-1 resize-y"
                          >
                            <Input
                              defaultValue={currentValue}
                              onBlur={(e) =>
                                handleInputChange(
                                  user.id,
                                  field.id,
                                  e.target.value,
                                  field.type,
                                )
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
