import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { getContactContent } from "@/features/site-content/queries";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const contact = await getContactContent();
  return (
    <>
      <AnnouncementBar />
      <SiteHeader contact={{ phone: contact.phone, phoneHref: contact.phoneHref }} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
