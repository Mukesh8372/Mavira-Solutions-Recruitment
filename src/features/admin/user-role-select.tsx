"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { setUserRole } from "@/features/admin/actions";
import { Select } from "@/components/ui/select";

const roles = [
  { value: "ADMIN", label: "Admin" },
  { value: "STAFF", label: "Staff" },
  { value: "EMPLOYER", label: "Employer" },
  { value: "CANDIDATE", label: "Candidate" },
];

export function UserRoleSelect({
  userId,
  role,
  canEdit,
  isSelf,
}: {
  userId: string;
  role: string;
  /** Only ADMINs may change roles — STAFF see a disabled control. */
  canEdit: boolean;
  isSelf: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const disabled = !canEdit || isSelf || pending;

  return (
    <Select
      aria-label="Change user role"
      title={!canEdit ? "Only admins can change roles" : isSelf ? "You can't change your own role" : undefined}
      value={role}
      disabled={disabled}
      className="h-9 w-36 text-[13.5px]"
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          const res = await setUserRole(userId, next);
          if (res.ok) toast.success(res.message ?? "Role updated");
          else toast.error(res.error);
        });
      }}
    >
      {roles.map((r) => (
        <option key={r.value} value={r.value}>
          {r.label}
        </option>
      ))}
    </Select>
  );
}
