"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { scheduleInterview } from "@/features/employers/actions";
import { interviewSchema, type InterviewInput } from "@/features/employers/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";

/** "Now" formatted for a datetime-local input, in local time. */
function localDatetimeNow(): string {
  const d = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000);
  return d.toISOString().slice(0, 16);
}

export function InterviewForm({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InterviewInput>({
    resolver: zodResolver(interviewSchema),
    defaultValues: { applicationId, mode: "VIDEO" },
  });

  const mode = useWatch({ control, name: "mode" });

  const onSubmit = (values: InterviewInput) => {
    setServerError(null);
    startTransition(async () => {
      const res = await scheduleInterview({ ...values, applicationId });
      if (res.ok) {
        toast.success("Interview scheduled");
        router.push("/employer/interviews");
        router.refresh();
      } else {
        setServerError(res.error);
        toast.error(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <p role="alert" className="rounded-btn border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-[13.5px] font-medium text-destructive">
          {serverError}
        </p>
      )}
      <input type="hidden" {...register("applicationId")} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="iv-when" label="Date and time" error={errors.scheduledAt?.message}>
          {(a11y) => (
            <Input
              {...a11y}
              type="datetime-local"
              onFocus={(e) => {
                // Set min lazily so the render stays pure; the server action re-validates anyway.
                e.currentTarget.min = localDatetimeNow();
              }}
              {...register("scheduledAt")}
            />
          )}
        </Field>
        <Field id="iv-mode" label="Mode" error={errors.mode?.message}>
          {(a11y) => (
            <Select {...a11y} {...register("mode")}>
              <option value="VIDEO">Video call</option>
              <option value="CALL">Phone call</option>
              <option value="ONSITE">In person</option>
            </Select>
          )}
        </Field>
      </div>
      {mode === "VIDEO" && (
        <Field id="iv-url" label="Meeting link" error={errors.meetingUrl?.message} hint="Google Meet, Zoom or Teams link — shared with the candidate.">
          {(a11y) => <Input {...a11y} type="url" placeholder="https://meet.google.com/…" {...register("meetingUrl")} />}
        </Field>
      )}
      {mode === "ONSITE" && (
        <Field id="iv-location" label="Location" error={errors.location?.message} hint="Office address or meeting point.">
          {(a11y) => <Input {...a11y} placeholder="Finlark Technologies, Koramangala, Bengaluru" {...register("location")} />}
        </Field>
      )}
      <Field id="iv-interviewer" label="Interviewer (optional)" error={errors.interviewer?.message}>
        {(a11y) => <Input {...a11y} placeholder="Priya Sharma, Engineering Manager" {...register("interviewer")} />}
      </Field>
      <Button type="submit" loading={pending}>
        Schedule interview
      </Button>
    </form>
  );
}
