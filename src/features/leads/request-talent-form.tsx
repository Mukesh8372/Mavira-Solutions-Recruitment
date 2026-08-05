"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, PhoneCall } from "lucide-react";
import { toast } from "sonner";
import { createLead } from "@/features/leads/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const HIRING_TYPES = [
  "Permanent Recruitment",
  "Executive Search",
  "Bulk Hiring",
  "BFSI Recruitment",
  "Broking Recruitment",
  "Not sure",
] as const;

const schema = z.object({
  companyName: z.string().trim().min(2, "Enter your company name").max(120),
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid work email"),
  phone: z.string().trim().min(8, "Enter a valid phone number").max(16, "Enter a valid phone number"),
  hiringType: z.enum(HIRING_TYPES, { message: "Choose what you're hiring for" }),
  rolesNeeded: z.string().trim().max(200, "Keep this under 200 characters").optional(),
  message: z.string().trim().max(1500, "Keep your message under 1500 characters").optional(),
  website: z.string().max(0).optional(), // honeypot
});

type FormValues = z.infer<typeof schema>;

export function RequestTalentForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (done) {
    return (
      <div
        role="status"
        className="flex h-full flex-col items-start justify-center gap-4 rounded-card border border-accent/30 bg-accent-soft p-8"
      >
        <span className="grid size-12 place-items-center rounded-full bg-accent text-white">
          <Check className="size-5" strokeWidth={3} aria-hidden />
        </span>
        <div>
          <p className="text-lg font-bold text-foreground">Request received</p>
          <p className="mt-1.5 max-w-sm text-[14.5px] leading-relaxed text-body">
            A delivery lead will call you within one business day to scope the roles, timelines and commercials.
          </p>
        </div>
        <p className="flex items-center gap-2 text-[13.5px] font-medium text-body">
          <PhoneCall className="size-4 text-accent" aria-hidden />
          In a hurry? Call us now — we pick up.
        </p>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await createLead(values);
    if (res.ok) {
      setDone(true);
      toast.success("Request received — a delivery lead will call you within one business day.");
    } else {
      setServerError(res.error);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      {/* Honeypot — hidden from humans, tempting for bots */}
      <div className="absolute -left-[9999px] top-auto" aria-hidden>
        <label htmlFor="rt-website">Website</label>
        <input id="rt-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="rt-company" label="Company name" error={errors.companyName?.message}>
          {(props) => <Input {...props} placeholder="Acme Industries Pvt. Ltd." autoComplete="organization" {...register("companyName")} />}
        </Field>
        <Field id="rt-name" label="Your name" error={errors.name?.message}>
          {(props) => <Input {...props} placeholder="Full name" autoComplete="name" {...register("name")} />}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="rt-email" label="Work email" error={errors.email?.message}>
          {(props) => <Input {...props} type="email" placeholder="you@company.com" autoComplete="email" {...register("email")} />}
        </Field>
        <Field id="rt-phone" label="Phone" error={errors.phone?.message}>
          {(props) => <Input {...props} type="tel" placeholder="+91 98xxx xxxxx" autoComplete="tel" {...register("phone")} />}
        </Field>
      </div>

      <Field id="rt-hiring-type" label="What are you hiring for?" error={errors.hiringType?.message}>
        {(props) => (
          <Select {...props} defaultValue="" {...register("hiringType")}>
            <option value="" disabled>
              Select an engagement type
            </option>
            {HIRING_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        id="rt-roles"
        label="Roles needed"
        hint="e.g. 2 backend engineers, 1 finance controller"
        error={errors.rolesNeeded?.message}
      >
        {(props) => <Input {...props} placeholder="Role titles and rough headcount" {...register("rolesNeeded")} />}
      </Field>

      <Field id="rt-message" label="Anything else? (optional)" error={errors.message?.message}>
        {(props) => (
          <Textarea {...props} placeholder="Timelines, locations, budget band — whatever helps us prepare." {...register("message")} />
        )}
      </Field>

      {serverError && (
        <p role="alert" className="rounded-btn bg-destructive/10 px-3.5 py-2.5 text-[13.5px] font-medium text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full sm:w-auto">
        Request a callback
      </Button>
      <p className="text-[12.5px] text-faint">
        No spam, no obligation — one scoping call, then you decide. We respond within one business day.
      </p>
    </form>
  );
}
