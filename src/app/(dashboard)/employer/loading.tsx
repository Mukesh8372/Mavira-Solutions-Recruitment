import { Skeleton } from "@/components/ui/skeleton";

export default function EmployerLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-card" />
        ))}
      </div>
      <Skeleton className="mt-6 h-64 rounded-card" />
    </div>
  );
}
