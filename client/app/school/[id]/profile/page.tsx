/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import moment from "moment";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderCircle, X, School } from "lucide-react";
import { FileUploader } from "@/components/shared/upload/file-uploader";
import { editUserSchema } from "@/lib/validations";
import axiosInstance from "@/lib/axiosInstance";
import { getUser } from "@/fetches/user";
import { useUploadFile } from "@/hooks/use-upload-file";
import { useToast } from "@/hooks/use-toast";

type FormData = z.infer<typeof editUserSchema>;

export default function EditProfileForm() {
  const { id: schoolId } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const { onUpload, progresses, uploadedFiles, setUploadedFiles, isUploading } =
    useUploadFile({ defaultUploadedFiles: [] });

  const form = useForm<FormData>({
    defaultValues: {
      fullName: "",
      avatarUrl: "",
      rollNumber: "",
    },
    resolver: zodResolver(editUserSchema),
  });

  const [userData, setUserData] = useState<any>(null);
  const lastUploadedFile = uploadedFiles.at(-1);

  useEffect(() => {
    const fetchData = async () => {
      const user = await getUser();
      setUserData(user);
      const school = user.schools?.find((s: any) => s.schoolId === schoolId);
      form.reset({
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        rollNumber: school?.rollNumber ?? "",
      });
    };
    fetchData();
  }, [schoolId]);

  useEffect(() => {
    if (lastUploadedFile) {
      form.setValue("avatarUrl", lastUploadedFile.url);
    }
  }, [lastUploadedFile]);

  const onSubmit = async (data: FormData) => {
    try {
      const token = await getCookie("token");
      await axiosInstance.put(
        "/me",
        { ...data, schoolId },
        { headers: { Authorization: token } },
      );
      toast({ title: "Success", description: "Profile updated!" });
      router.refresh();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err?.response?.data?.message ?? "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl text-foreground mx-auto p-6">
      <div className="relative bg-white border shadow-lg rounded-2xl p-8 space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          {userData?.avatarUrl ? (
            <Image
              src={userData.avatarUrl || "/default-avatar.png"}
              width={128}
              height={128}
              className="rounded-full border-4 border-primary object-cover shadow-md"
              alt="User Avatar"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-primary text-white flex items-center justify-center font-bold text-4xl shadow-md">
              {userData?.fullName?.charAt(0)}
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{userData?.fullName}</h2>
            <p className="text-sm text-gray-500">{userData?.email}</p>
            <p className="text-xs text-gray-400">
              Joined {moment(userData?.createdAt).format("MMM DD, YYYY")} · Last
              updated {moment(userData?.updatedAt).fromNow()}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
            <School size={18} /> School Memberships
          </h3>
          {userData?.schools?.map((s: any) => (
            <div
              key={s.schoolId}
              className={`rounded-xl p-4 ${
                s.schoolId === schoolId
                  ? "bg-gray-100 ring-2 ring-primary"
                  : "bg-gray-50 border border-gray-200"
              } space-y-1`}
            >
              <p className="text-md font-medium">
                {s.school.name}{" "}
                <span className="ml-2 text-xs px-2 py-0.5 bg-primary text-white rounded-full">
                  {s.role}
                </span>
              </p>
              {s.rollNumber && (
                <p className="text-sm text-gray-600">Roll No: {s.rollNumber}</p>
              )}
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="fullName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <label className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Full Name"
                      className="bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              name="rollNumber"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <label className="text-sm font-medium text-gray-700">
                    Roll Number
                  </label>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Roll Number"
                      className="bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <FormField
              name="avatarUrl"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  {field.value && (
                    <div className="flex items-center justify-between mb-3">
                      <Image
                        src={field.value}
                        alt="Uploaded Avatar"
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        type="button"
                        onClick={() => {
                          form.setValue("avatarUrl", "");
                          setUploadedFiles([]);
                        }}
                        className="hover:text-red-400"
                      >
                        <X size={18} />
                      </Button>
                    </div>
                  )}
                  <FormControl>
                    <FileUploader
                      progresses={progresses}
                      onUpload={onUpload}
                      disabled={isUploading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUploadedFiles([]);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-white"
                disabled={
                  form.formState.isSubmitting ||
                  isUploading ||
                  !form.formState.isDirty
                }
              >
                {form.formState.isSubmitting ? (
                  <LoaderCircle className="animate-spin" size={20} />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
