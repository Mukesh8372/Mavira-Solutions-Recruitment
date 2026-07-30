"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { createContactQuery } from "@/features/contact/actions";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().max(16, "Enter a valid phone number").optional(),
  audience: z.enum(["EMPLOYER", "CANDIDATE", "OTHER"], { message: "Tell us who you are" }),
  message: z.string().trim().min(10, "Tell us a little more — at least 10 characters").max(2000, "Keep your message under 2000 characters"),
  website: z.string().max(0).optional(), // honeypot
});

type FormValues = z.infer<typeof schema>;

const audiences = [
  { value: "EMPLOYER", label: "I'm hiring" },
  { value: "CANDIDATE", label: "I'm job hunting" },
  { value: "OTHER", label: "Something else" },
] as const;

export function ContactForm({
  responseSla = siteConfig.responseSla,
  phone = siteConfig.phone,
}: {
  responseSla?: string;
  phone?: string;
}) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { audience: "EMPLOYER" } });

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
          <p className="text-lg font-bold text-foreground">Message sent</p>
          <p className="mt-1.5 max-w-sm text-[14.5px] leading-relaxed text-body">
            Thanks for writing in. {responseSla} For anything urgent, call or WhatsApp us on{" "}
            {phone}.
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await createContactQuery(values);
    if (res.ok) {
      setDone(true);
      toast.success("Message sent — we'll get back to you within one business day.");
    } else {
      setServerError(res.error);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      {/* Honeypot — hidden from humans, tempting for bots */}
      <div className="absolute -left-[9999px] top-auto" aria-hidden>
        <label htmlFor="ct-website">Website</label>
        <input id="ct-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <fieldset>
        <legend className="mb-1.5 block text-[13.5px] font-semibold text-foreground">Who are you?</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Who are you">
          {audiences.map((a) => (
            <label
              key={a.value}
              className={cn(
                "flex cursor-pointer items-center justify-center rounded-btn border border-line bg-surface px-3 py-2.5 text-center text-[13.5px] font-semibold text-body transition-colors hover:border-faint",
                "has-checked:border-primary has-checked:bg-primary-soft has-checked:text-primary",
                "has-focus-visible:outline-2 has-focus-visible:outline-primary"
              )}
            >
              <input type="radio" value={a.value} className="sr-only" {...register("audience")} />
              {a.label}
            </label>
          ))}
        </div>
        {errors.audience && (
          <p role="alert" className="mt-1.5 text-[12.5px] font-medium text-destructive">
            {errors.audience.message}
          </p>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="ct-name" label="Name" error={errors.name?.message}>
          {(props) => <Input {...props} placeholder="Full name" autoComplete="name" {...register("name")} />}
        </Field>
        <Field id="ct-phone" label="Phone (optional)" error={errors.phone?.message}>
          {(props) => <Input {...props} type="tel" placeholder="+91 98xxx xxxxx" autoComplete="tel" {...register("phone")} />}
        </Field>
      </div>

      <Field id="ct-email" label="Email" error={errors.email?.message}>
        {(props) => <Input {...props} type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />}
      </Field>

      <Field id="ct-message" label="How can we help?" error={errors.message?.message}>
        {(props) => (
          <Textarea
            {...props}
            className="min-h-36"
            placeholder="Roles you're hiring for, a job you're chasing, a partnership idea — the more specific, the faster we can help."
            {...register("message")}
          />
        )}
      </Field>

      {serverError && (
        <p role="alert" className="rounded-btn bg-destructive/10 px-3.5 py-2.5 text-[13.5px] font-medium text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" loading={isSubmitting} className="w-full sm:w-auto">
        Send message
      </Button>
      <p className="text-[12.5px] text-faint">{responseSla}</p>
    </form>
  );
}
