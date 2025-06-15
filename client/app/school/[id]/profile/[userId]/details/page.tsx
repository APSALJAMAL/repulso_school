"use client";
import { use } from "react";
import Portfolio from "./Portfolio";

export default function DetailsPage({
  params,
}: {
  params: Promise<{ id: string; userId: string }>;
}) {
  const resolvedParams = use(params);
  const schoolId = resolvedParams.id;
  const userId = resolvedParams.userId;

  return <Portfolio schoolId={schoolId} userId={userId} />;
}
