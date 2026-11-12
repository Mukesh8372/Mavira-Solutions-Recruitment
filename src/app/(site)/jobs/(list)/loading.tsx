import { Skeleton } from "@/components/ui/skeleton";

/** Route-level skeleton mirroring the /jobs layout: header band, sidebar, result cards. */
export default function JobsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading job openings">
      <section className="border-b border-line bg-background-alt">
        <div className="container-site py-10 md:py-14">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-6 h-11 w-80 max-w-full" />
          <Skeleton className="mt-4 h-4 w-full max-w-xl" />
          <div className="mt-7 flex max-w-3xl flex-col gap-2.5 sm:flex-row">
            <Skeleton className="h-11 flex-1 rounded-btn" />
            <Skeleton className="h-11 rounded-btn sm:w-64" />
            <Skeleton className="h-11 w-28 rounded-btn" />
          </div>
        </div>
      </section>

      <section className="container-site py-10 md:py-14">
        <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          <div className="hidden rounded-card border border-line bg-surface p-5 shadow-soft lg:block">
            <Skeleton className="h-5 w-20" />
            <div className="mt-5 flex flex-col gap-2.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" style={{ width: `${65 + ((i * 13) % 30)}%` }} />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-48 rounded-btn" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="rounded-card border border-line bg-surface p-5 shadow-soft">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="mt-2.5 h-4 w-1/2" />
                  <div className="mt-4 flex gap-1.5">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
