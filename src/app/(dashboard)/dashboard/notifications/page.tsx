import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MarkAllReadButton } from "@/features/candidates/mark-read-button";
import { getNotifications } from "@/features/candidates/queries";
import { formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications", robots: { index: false } };

export default async function NotificationsPage() {
  const session = await auth();
  const notifications = await getNotifications(session!.user.id);
  const unread = notifications.filter((n) => !n.readAt).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `${unread} unread` : "You're all caught up."}
        actions={unread > 0 ? <MarkAllReadButton /> : undefined}
      />
      {notifications.length === 0 ? (
        <EmptyState
          icon="bell"
          title="No notifications yet"
          body="Status changes, interview invites and matched roles will show up here."
        />
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={cn(
                "rounded-card border border-line bg-surface px-4 py-3.5",
                !n.readAt && "border-primary/30 bg-primary-soft/40"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-foreground">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-[13px] text-body">{n.body}</p>}
                  {n.link && (
                    <Link href={n.link} className="mt-1 inline-block text-[13px] font-semibold text-primary hover:underline">
                      View →
                    </Link>
                  )}
                </div>
                <span className="shrink-0 text-[12px] text-faint">{formatRelativeDate(n.createdAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
