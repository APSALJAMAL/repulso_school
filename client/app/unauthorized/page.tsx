"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="bg-red-100 text-red-600 p-6 rounded-full mb-6 shadow-lg">
        <AlertTriangle className="w-16 h-16" />
      </div>

      <h1 className="text-3xl font-bold mb-2 text-red-700">
        403 – Unauthorized
      </h1>
      <p className="text-muted-foreground text-lg mb-6">
        You do not have access to this page.
      </p>

      <Button variant="outline" onClick={() => router.back()} className="mt-2">
        Go Back
      </Button>
    </div>
  );
}
