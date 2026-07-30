import { getClientLogos } from "@/features/site-content/queries";

/** Grayscale wordmark marquee — pauses on hover, static for reduced motion. */
export async function LogoMarquee() {
  const { logos: clientLogos } = await getClientLogos();
  return (
    <section aria-label="Client companies" className="border-y border-line bg-background-alt py-8">
      <div className="container-site">
        <p className="mb-5 text-center text-[13px] font-semibold uppercase tracking-[0.08em] text-faint">
          Trusted by 500+ companies across India
        </p>
        <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <ul className="flex w-max animate-marquee items-center gap-14 group-hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:animate-none">
            {[...clientLogos, ...clientLogos].map((name, i) => (
              <li
                key={`${name}-${i}`}
                aria-hidden={i >= clientLogos.length}
                className="whitespace-nowrap text-lg font-extrabold tracking-tight text-faint/70 transition-colors hover:text-body"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
