import { SealedLetter } from "@/components/illustrations/wayfinding"
import { LegalNav } from "@/components/legal/legal-nav"
import { SiteFooter } from "@/components/site-footer"
import { Email } from "@/components/site/email"
import { site } from "@/lib/site"

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <main id="content" className="sky-legal">
        <div className="mx-auto grid max-w-[1240px] grid-cols-1 gap-10 px-4 pt-[6.5rem] pb-24 sm:px-6 md:pt-[7.5rem] md:pb-32 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20 lg:px-8">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <SealedLetter className="mb-6 hidden h-auto w-[8.5rem] lg:block" />
            <LegalNav />
            <p className="mt-10 hidden text-[0.95rem] text-ink-soft lg:block">
              Questions about these documents?{" "}
              <a
                href={`mailto:${site.email}`}
                className="link-under font-[650] text-teal"
              >
                <Email />
              </a>
            </p>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
