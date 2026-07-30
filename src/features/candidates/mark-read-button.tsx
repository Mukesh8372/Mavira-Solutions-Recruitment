"use client";

import { useTransition } from "react";
import { markNotificationsRead } from "@/features/candidates/actions";
import { Button } from "@/components/ui/button";

export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      loading={pending}
      onClick={() => startTransition(async () => void (await markNotificationsRead()))}
    >
      Mark all read
    </Button>
  );
}
