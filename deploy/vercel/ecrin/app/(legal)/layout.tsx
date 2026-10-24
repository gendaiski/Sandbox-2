import { LegalNav } from "@/components/legal/legal-nav"
import { site } from "@/lib/site"

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative overflow-x-clip px-(--gutter)">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(60%_70%_at_70%_0%,rgb(26_121_113/0.28),transparent_70%),radial-gradient(40%_50%_at_20%_0%,rgb(197_153_64/0.1),transparent_70%)]"
      />
      <div className="relative mx-auto grid max-w-[78rem] grid-cols-1 gap-10 pt-28 pb-[clamp(5rem,3.5rem+6vw,9rem)] md:pt-36 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-20 lg:pt-40">
        <aside className="min-w-0 lg:sticky lg:top-10 lg:self-start">
          <p className="mb-4 hidden text-sm text-cream/55 lg:block">
            Legal documents
          </p>
          <LegalNav />
          <p className="mt-10 hidden text-sm leading-relaxed text-cream/62 lg:block">
            Questions about these terms?{" "}
            <a
              href={`mailto:${site.email}`}
              className="font-medium text-gold-light underline underline-offset-4"
            >
              {site.email}
            </a>
          </p>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
