import { LegalNav } from "@/components/legal/legal-nav"
import { site } from "@/lib/site"

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-[86rem] grid-cols-1 gap-8 px-4 pt-6 pb-28 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14 lg:px-10 lg:pt-12 lg:pb-36">
      <aside className="min-w-0 lg:sticky lg:top-8 lg:self-start">
        <LegalNav />
        <p className="mt-10 hidden max-w-[24ch] text-[0.9375rem] leading-[1.5] text-ink-soft lg:block">
          Questions about any of these documents?{" "}
          <a
            href={"mailto:" + site.email}
            className="font-semibold text-ink underline decoration-2 underline-offset-4 hover:decoration-teal"
          >
            {site.email}
          </a>
        </p>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
