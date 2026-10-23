import { Container } from "@/components/edito/primitives"
import { LegalNav, LegalPager } from "@/components/legal/legal-nav"
import { site } from "@/lib/site"

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Container className="pb-24 lg:pb-36">
      <div className="flex items-baseline justify-between gap-6 border-t border-gold/70 pt-3 text-[0.8125rem] leading-none text-ink-soft">
        <span>Legal information</span>
        <span className="hidden sm:inline">
          {site.company.legalName}, {site.company.form}
        </span>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-10 lg:mt-14 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-[clamp(3rem,7vw,8rem)]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <LegalNav />
          <p className="mt-10 hidden text-[0.875rem] leading-[1.6] text-ink-soft lg:block">
            Questions about these documents?{" "}
            <a href={`mailto:${site.email}`} className="link-edito">
              {site.email}
            </a>
          </p>
        </aside>
        <div className="min-w-0">
          {children}
          <LegalPager />
        </div>
      </div>
    </Container>
  )
}
