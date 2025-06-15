/* eslint-disable prettier/prettier */
"use client";

import { useEffect, useState } from "react";
import { CustomField, CustomValue } from "@/types/custom";
import CustomFieldForm from "./CustomFieldForm";
import CustomValueForm from "./CustomValueForm";
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

export default function CustomFieldsPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [values, setValues] = useState<CustomValue[]>([]);
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
        api.get(`/fields/user/${uid}`),
        api.get(`/values/user/${uid}`),
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
    loadUserAndData();
  }, []);

  const getValue = (fieldId: number) =>
    values.find((v) => v.fieldId === fieldId)?.value ?? "Not filled";

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
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="w-xl h-fit">
          <CardHeader>
            <CardTitle className="text-xl">
              {fieldToEdit ? "Edit Custom Field" : "Add Custom Field"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomFieldForm
              userId={userId}
              fieldToEdit={fieldToEdit}
              onSuccess={() => {
                setFieldToEdit(null);
                loadUserAndData();
              }}
              onCancel={() => setFieldToEdit(null)}
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-4">
          {fields.map((field) => (
            <Card key={field.id} className="transition hover:shadow-lg">
              <CardHeader>
                <CardTitle>
                  {field.label}{" "}
                  <span className="text-sm text-muted-foreground">
                    ({field.key})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-muted-foreground text-sm">
                  Type: {field.type}
                </div>
                <div>
                  <strong>Current Value:</strong>{" "}
                  <span className="italic">{getValue(field.id)}</span>
                </div>
                <CustomValueForm
                  userId={userId}
                  fieldId={field.id}
                  onSuccess={loadUserAndData}
                />
                <div className="pt-4 flex gap-2">
                  <Button
                    variant="outline"
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
