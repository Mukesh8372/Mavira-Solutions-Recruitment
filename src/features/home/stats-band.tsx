import { StatCounter } from "@/components/shared/stat-counter";
import { Reveal } from "@/components/shared/reveal";

export type SiteStats = {
  candidatesPlaced: number;
  clientCompanies: number;
  yearsExperience: number;
  googleRating: number;
};

export function StatsBand({ stats }: { stats: SiteStats }) {
  const items = [
    { value: stats.candidatesPlaced, suffix: "+", label: "candidates placed" },
    { value: stats.clientCompanies, suffix: "+", label: "client companies" },
    { value: stats.yearsExperience, suffix: "+", label: "years of experience" },
    { value: stats.googleRating, suffix: "★", label: "Google rating", decimals: 1 },
  ];
  return (
    <section aria-label="Company statistics" className="container-site py-14 md:py-16">
      <Reveal>
        <dl className="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.label}>
              <dd className="text-4xl font-extrabold tracking-tight text-foreground md:text-[44px]">
                <StatCounter value={item.value} suffix={item.suffix} decimals={item.decimals ?? 0} />
              </dd>
              <dt className="mt-1.5 text-[13.5px] font-medium text-body">{item.label}</dt>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
