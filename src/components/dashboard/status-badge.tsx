import { Badge } from "@/components/ui/badge";
import { labelApplicationStatus, labelLeadStatus } from "@/lib/format";

const applicationTones: Record<string, "blue" | "purple" | "green" | "red" | "amber" | "neutral"> = {
  APPLIED: "blue",
  SCREENING: "amber",
  SHORTLISTED: "purple",
  INTERVIEW: "purple",
  OFFERED: "green",
  PLACED: "green",
  REJECTED: "red",
  WITHDRAWN: "neutral",
};

export function ApplicationStatusBadge({ status }: { status: string }) {
  return <Badge variant={applicationTones[status] ?? "neutral"}>{labelApplicationStatus(status)}</Badge>;
}

const leadTones: Record<string, "blue" | "purple" | "green" | "red" | "amber" | "neutral"> = {
  NEW: "blue",
  CONTACTED: "amber",
  QUALIFIED: "purple",
  CONVERTED: "green",
  LOST: "neutral",
};

export function LeadStatusBadge({ status }: { status: string }) {
  return <Badge variant={leadTones[status] ?? "neutral"}>{labelLeadStatus(status)}</Badge>;
}

const jobTones: Record<string, "blue" | "green" | "amber" | "neutral"> = {
  DRAFT: "amber",
  PUBLISHED: "green",
  CLOSED: "neutral",
  ARCHIVED: "neutral",
};

export function JobStatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { DRAFT: "Draft", PUBLISHED: "Published", CLOSED: "Closed", ARCHIVED: "Archived" };
  return <Badge variant={jobTones[status] ?? "neutral"}>{labels[status] ?? status}</Badge>;
}

const interviewTones: Record<string, "blue" | "green" | "red" | "neutral"> = {
  SCHEDULED: "blue",
  COMPLETED: "green",
  CANCELLED: "neutral",
  NO_SHOW: "red",
};

export function InterviewStatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = { SCHEDULED: "Scheduled", COMPLETED: "Completed", CANCELLED: "Cancelled", NO_SHOW: "No-show" };
  return <Badge variant={interviewTones[status] ?? "neutral"}>{labels[status] ?? status}</Badge>;
}
