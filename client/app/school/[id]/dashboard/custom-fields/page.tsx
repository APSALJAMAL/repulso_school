/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
"use client";

import { useEffect, useState } from "react";
import { CustomField, CustomValue } from "@/types/custom";
import CustomFieldForm from "./CustomFieldForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import api from "./api";
import { getCookie } from "cookies-next";
import { useParams } from "next/navigation";


export default function CustomFieldsPage() {
  const params = useParams();
  const schoolId = params?.id as string; // ✅ get schoolId from route

  const [userId, setUserId] = useState<number | null>(null);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [, setValues] = useState<CustomValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [fieldToEdit, setFieldToEdit] = useState<CustomField | null>(null);
  const loadUserAndData = async () => {
    try {
      const token = await getCookie("token");
      const userRes = await api.get("/me", {
        headers: { Authorization: token },
      });
      const uid = userRes.data?.id;
      setUserId(uid);

      const [fieldRes, valueRes] = await Promise.all([
        api.get(`/fields/school/${schoolId}`),
        api.get(`/values/school/${schoolId}`),
      ]);

      setFields(fieldRes.data);
      setValues(valueRes.data);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (schoolId) {
      loadUserAndData();
    }
  }, [schoolId]);

  if (loading || !userId) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-24 mb-4" />
        <Skeleton className="h-24 mb-4" />
      </div>
    );
  }

  return (
    <div className="py-10 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto space-y-10">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
        🛠️ Custom Fields
      </h1>
      <p className="text-muted-foreground text-sm">
        Add and manage your custom fields dynamically.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add/Edit Form */}
        <Card className="col-span-1 w-80 h-fit shadow-xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-800 dark:text-white">
              {fieldToEdit ? "✏️ Edit Custom Field" : "➕ Add Custom Field"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomFieldForm
              userId={userId}
              schoolId={schoolId} 
              fieldToEdit={fieldToEdit}
              onSuccess={() => {
                setFieldToEdit(null);
                loadUserAndData();
              }}
              onCancel={() => setFieldToEdit(null)}
            />
          </CardContent>
        </Card>

        {/* Field List */}
        <div className="md:col-span-2 grid grid-cols-3 h-fit sm:grid-cols-2 gap-6">
          {fields.map((field) => (
            <Card
              key={field.id}
              className="border rounded-2xl p-4 hover:shadow-lg transition-transform hover:-translate-y-1 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-lg font-bold text-zinc-800 dark:text-white">
                  {field.label}
                  <span className="text-sm font-normal text-muted-foreground ml-1">
                    ({field.key})
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0 pt-2 space-y-3">
                <div className="text-sm text-muted-foreground">
                  🧬 Type: <span className="font-medium">{field.type}</span>
                </div>

                <div className="pt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setFieldToEdit(field)}
                  >
                    Edit Field
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
