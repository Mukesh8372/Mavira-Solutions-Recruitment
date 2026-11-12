import { TriangleAlert } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { ResolveIncidentButton } from "@/features/jobs/incident-actions";

type Incident = { id: string; kind: string; message: string; createdAt: Date };

const kindLabels: Record<string, string> = {
  "resume.upload": "Resume upload failed",
  "resume.download": "Resume download failed",
  "resume.delete": "Resume delete failed",
  "cron.cleanup": "Cleanup job failed",
};

/** Red banner on /admin listing unresolved storage and job failures. Renders nothing when there are none. */
export function IncidentBanner({ incidents }: { incidents: Incident[] }) {
  if (incidents.length === 0) return null;
  return (
    <section role="alert" aria-labelledby="incidents-heading" className="mb-6 rounded-card border border-destructive/40 bg-destructive/8 p-5">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 id="incidents-heading" className="text-[15px] font-bold text-foreground">
            {incidents.length} unresolved {incidents.length === 1 ? "incident" : "incidents"}
          </h2>
          <p className="mt-0.5 text-[13.5px] text-body">
            Candidates saw an error and were asked to email their resume. Check the storage settings, then mark each incident resolved.
          </p>
          <ul className="mt-3 divide-y divide-destructive/15">
            {incidents.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-[13.5px]">
                <span>
                  <span className="font-semibold text-foreground">{kindLabels[i.kind] ?? i.kind}</span>
                  <span className="text-body"> — {i.message}</span>
                  <span className="block text-[12px] text-faint">{formatDateTime(i.createdAt)}</span>
                </span>
                <ResolveIncidentButton id={i.id} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
