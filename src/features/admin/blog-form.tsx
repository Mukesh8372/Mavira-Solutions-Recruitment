"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { saveBlogPost } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { slugify } from "@/lib/utils";

const schema = z.object({
  title: z.string().trim().min(3, "Add a title").max(120, "Keep the title under 120 characters"),
  slug: z.string().trim().max(80, "Keep the slug under 80 characters").optional(),
  excerpt: z.string().trim().min(10, "Add a short excerpt").max(300, "Keep the excerpt under 300 characters"),
  content: z.string().trim().min(50, "The post body looks too short"),
  category: z.enum(["career-advice", "hiring-insights", "industry-news"]),
  tags: z.string().trim().max(200).optional(),
  readMinutes: z.coerce.number().int("Whole minutes only").min(1, "At least 1 minute").max(60, "Keep it under an hour"),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});
type Values = z.input<typeof schema>;

const categories = [
  { value: "career-advice", label: "Career advice" },
  { value: "hiring-insights", label: "Hiring insights" },
  { value: "industry-news", label: "Industry news" },
];

export function BlogForm({ postId, defaults }: { postId?: string; defaults?: Partial<Values> }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Once the editor touches the slug (or we're editing an existing post), stop auto-filling it.
  const slugTouched = useRef(Boolean(defaults?.slug));

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "DRAFT",
      category: "career-advice",
      readMinutes: 4,
      ...defaults,
    },
  });

  const onSubmit = (values: Values) => {
    setServerError(null);
    startTransition(async () => {
      const parsed = schema.parse(values);
      const res = await saveBlogPost({ ...parsed, id: postId });
      if (res.ok) {
        toast.success(res.message ?? "Post saved");
        router.push("/admin/blog");
        router.refresh();
      } else {
        setServerError(res.error);
        toast.error(res.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-4" noValidate>
      {serverError && (
        <p
          role="alert"
          className="rounded-btn border border-destructive/30 bg-destructive/8 px-3.5 py-2.5 text-[13.5px] font-medium text-destructive"
        >
          {serverError}
        </p>
      )}

      <Field id="bp-title" label="Title" error={errors.title?.message}>
        {(a11y) => (
          <Input
            {...a11y}
            {...register("title", {
              onChange: (e) => {
                if (!slugTouched.current) setValue("slug", slugify(e.target.value));
              },
            })}
          />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="bp-slug" label="Slug" error={errors.slug?.message} hint="Auto-filled from the title. Lowercase and hyphens.">
          {(a11y) => (
            <Input
              {...a11y}
              placeholder="how-to-negotiate-your-ctc"
              {...register("slug", { onChange: () => (slugTouched.current = true) })}
            />
          )}
        </Field>
        <Field id="bp-category" label="Category" error={errors.category?.message}>
          {(a11y) => (
            <Select {...a11y} {...register("category")}>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>

      <Field id="bp-excerpt" label="Excerpt" error={errors.excerpt?.message} hint="One or two sentences shown on listing cards.">
        {(a11y) => <Textarea {...a11y} rows={2} {...register("excerpt")} />}
      </Field>

      <Field id="bp-content" label="Content (Markdown)" error={errors.content?.message}>
        {(a11y) => <Textarea {...a11y} rows={16} className="font-mono text-[13.5px]" {...register("content")} />}
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="bp-tags" label="Tags" error={errors.tags?.message} hint="Comma-separated, up to 10.">
          {(a11y) => <Input {...a11y} placeholder="resume, interviews" {...register("tags")} />}
        </Field>
        <Field id="bp-read" label="Read time (minutes)" error={errors.readMinutes?.message}>
          {(a11y) => <Input {...a11y} type="number" min={1} max={60} {...register("readMinutes")} />}
        </Field>
        <Field id="bp-status" label="Status" error={errors.status?.message}>
          {(a11y) => (
            <Select {...a11y} {...register("status")}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </Select>
          )}
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending}>
          {postId ? "Save post" : "Create post"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/blog")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
