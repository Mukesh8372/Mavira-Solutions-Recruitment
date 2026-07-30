import { getAnnouncement } from "@/features/site-content/queries";
import { AnnouncementBarClient } from "@/components/layout/announcement-bar-client";

/** Admin-managed promo strip above the header. Renders nothing when disabled. */
export async function AnnouncementBar() {
  const announcement = await getAnnouncement();
  if (!announcement.enabled) return null;
  return (
    <AnnouncementBarClient
      text={announcement.text}
      linkLabel={announcement.linkLabel || undefined}
      href={announcement.href || undefined}
    />
  );
}
