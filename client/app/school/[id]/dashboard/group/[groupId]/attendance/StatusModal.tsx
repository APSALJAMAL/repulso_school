/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { Attendance, AttendanceStatus, Status } from "@/types/markattendance";
import { fetchStatuses, markUserStatus } from "./api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function StatusModal({
  attendance,
  onClose,
}: {
  attendance: Attendance;
  onClose: () => void;
}) {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(
    null,
  );

  const userId = 1; // assume current logged in user

  useEffect(() => {
    fetchStatuses(attendance.id).then((res) => {
      setStatuses(res.data);
      const myStatus = res.data.find((s: Status) => s.userId === userId);
      if (myStatus) setSelectedStatus(myStatus.status);
    });
  }, [attendance.id]);

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    await markUserStatus(attendance.id, userId, selectedStatus);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Status for {new Date(attendance.date).toLocaleDateString()}
          </DialogTitle>
        </DialogHeader>

        <Select
          value={selectedStatus || ""}
          onValueChange={(value: AttendanceStatus) => setSelectedStatus(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(AttendanceStatus).map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex justify-end mt-4">
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
