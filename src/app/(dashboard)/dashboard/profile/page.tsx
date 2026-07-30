import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProfileForm } from "@/features/candidates/profile-form";
import { ResumeManager } from "@/features/candidates/resume-manager";
import { getCandidateProfile, computeProfileCompletion } from "@/features/candidates/queries";
import { jsonArray } from "@/lib/utils";

export const metadata: Metadata = { title: "Resume & profile", robots: { index: false } };

export default async function ProfilePage() {
  const session = await auth();
  const profile = await getCandidateProfile(session!.user.id);
  if (!profile) return <EmptyState title="Profile not found" body="Contact support to restore your candidate profile." />;

  const completion = computeProfileCompletion(profile);

  return (
    <>
      <PageHeader
        title="Resume & profile"
        description="A complete profile gets matched to roles before they're even advertised."
      />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section aria-labelledby="profile-form-heading" className="rounded-card border border-line bg-surface p-6 shadow-soft">
          <h2 id="profile-form-heading" className="mb-4 text-[16px] font-bold">
            Profile details
          </h2>
          <ProfileForm
            defaults={{
              headline: profile.headline ?? "",
              summary: profile.summary ?? "",
              experienceYears: profile.experienceYears ?? undefined,
              location: profile.location ?? "",
              expectedSalary: profile.expectedSalary ?? undefined,
              skills: jsonArray(profile.skills).join(", "),
              phone: profile.user.phone ?? "",
            }}
          />
        </section>

        <div className="space-y-6">
          <section aria-labelledby="resume-heading" className="rounded-card border border-line bg-surface p-6 shadow-soft">
            <h2 id="resume-heading" className="mb-4 text-[16px] font-bold">
              Resumes
            </h2>
            <ResumeManager
              resumes={profile.resumes.map((r) => ({
                id: r.id,
                fileName: r.fileName,
                fileUrl: r.fileUrl,
                sizeBytes: r.sizeBytes,
                isPrimary: r.isPrimary,
              }))}
            />
          </section>

          <section aria-labelledby="strength-heading" className="rounded-card border border-line bg-surface p-6 shadow-soft">
            <h2 id="strength-heading" className="text-[16px] font-bold">
              Profile strength: {completion.score}%
            </h2>
            <ul className="mt-3 space-y-1.5 text-[13.5px]">
              {completion.checks.map((c) => (
                <li key={c.label} className={c.done ? "text-accent" : "text-body"}>
                  {c.done ? "✓" : "○"} {c.label}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
