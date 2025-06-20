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
import { Loader2 } from "lucide-react";

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
  const [saving, setSaving] = useState(false);
  const [fieldInputs, setFieldInputs] = useState<Record<string, string>>({});

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

      const initialInputs: Record<string, string> = {};
      usersRes.forEach((user) => {
        fieldsRes.data?.forEach((field: CustomField) => {
          const val = valuesRes.data?.find(
            (v: CustomValue) => v.userId === user.id && v.fieldId === field.id,
          )?.value;
          initialInputs[`${user.id}-${field.id}`] = val ?? "";
        });
      });
      setFieldInputs(initialInputs);
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

  const saveFieldValue = async (
    userId: number,
    fieldId: number,
    value: string,
    type: string,
    showToast = true,
  ) => {
    if (value.trim() === "") {
      toast.warning("⚠️ You can't leave this field empty");
      return;
    }

    if (!validateValue(value, type)) {
      toast.warning(`Invalid ${type.toLowerCase()} value`);
      return;
    }

    try {
      const token = await getToken();
      await axios.post(
        "/values",
        { userId, fieldId, value, schoolId },
        { headers: { Authorization: token } },
      );
      if (showToast) toast.success("✅ Value saved");
    } catch (err) {
      toast.error("❌ Failed to save value");
    }
  };

  const handleSaveAll = async () => {
    if (!Object.keys(modified).length) return;
    setSaving(true);
    toast.loading("Saving all values...");
    try {
      await Promise.all(
        Object.entries(modified).map(([key, value]) => {
          const [userId, fieldId] = key.split("-").map(Number);
          const field = fields.find((f) => f.id === fieldId);
          return field
            ? saveFieldValue(userId, fieldId, value, field.type, false)
            : null;
        }),
      );
      toast.dismiss();
      toast.success("✅ Database updated successfully");
      setModified({});
    } catch (err) {
      toast.dismiss();
      toast.error("❌ Failed to save all values");
    } finally {
      setSaving(false);
      loadData();
    }
  };

  const filteredUsers = users.filter((user) => {
    const baseMatch =
      user.fullName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const fieldMatch = fields.some((field) =>
      fieldInputs[`${user.id}-${field.id}`]
        ?.toLowerCase()
        .includes(search.toLowerCase()),
    );

    return baseMatch || fieldMatch;
  });

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-yellow-100  border-yellow-400 text-yellow-800">
        <CardContent className="p-4">
          ⚠️ Once updated, You can't leave any field empty. Instead use "-" to
          manage.
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-xl font-bold">
              Custom Field Database
            </CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              <Input
                placeholder="Search by name, email or field"
                className="w-60"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSaveAll} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save All
              </Button>
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
            <div className="overflow-auto rounded-lg border">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2 text-left">ID</th>
                    <th className="border px-3 py-2 text-left">Name</th>
                    <th className="border px-3 py-2 text-left">Roll No</th>
                    <th className="border px-3 py-2 text-left">Email</th>
                    <th className="border px-3 py-2 text-left">Role</th>
                    <th className="border px-3 py-2 text-left">Photo</th>
                    <th className="border px-3 py-2 text-left">Groups</th>
                    {fields.map((f) => (
                      <th key={f.id} className="border px-3 py-2 text-left">
                        <div>
                          <div className="font-semibold">{f.label}</div>
                          <div className="text-xs text-gray-500">{f.type}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="">
                      <td className="border px-3 py-2">{user.id}</td>
                      <td className="border px-3 py-2">{user.fullName}</td>
                      <td className="border px-3 py-2">
                        {user.rollNumber || "N/A"}
                      </td>
                      <td className="border px-3 py-2">{user.email}</td>
                      <td className="border px-3 py-2">{user.role}</td>
                      <td className="border px-3 py-2">
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
                      <td className="border px-3 py-2">
                        {Array.isArray(user.groups)
                          ? user.groups.map((g) => g.name).join(", ") || "N/A"
                          : "N/A"}
                      </td>
                      {fields.map((field) => {
                        const key = `${user.id}-${field.id}`;
                        const currentValue = fieldInputs[key] ?? "";
                        return (
                          <td key={key} className="border px-2 py-1">
                            <Input
                              value={currentValue}
                              placeholder="-"
                              onChange={(e) => {
                                const newValue = e.target.value;
                                setFieldInputs((prev) => ({
                                  ...prev,
                                  [key]: newValue,
                                }));
                              }}
                              onBlur={(e) => {
                                const val = e.target.value;
                                const originalVal =
                                  values.find(
                                    (v) =>
                                      v.userId === user.id &&
                                      v.fieldId === field.id,
                                  )?.value ?? "";

                                if (val !== originalVal) {
                                  saveFieldValue(
                                    user.id,
                                    field.id,
                                    val,
                                    field.type,
                                  );
                                  setModified((prev) => ({
                                    ...prev,
                                    [key]: val,
                                  }));
                                }
                              }}
                              className="h-8 text-xs"
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
