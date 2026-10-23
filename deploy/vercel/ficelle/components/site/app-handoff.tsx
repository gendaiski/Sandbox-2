import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { AppleIcon } from "@hugeicons/core-free-icons"

import { Mark } from "@/components/brand/logo"
import { Barcode } from "@/components/colis/barcode"
import { Stamp, Tape } from "@/components/colis/stamp"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"

/**
 * Page de repli des liens universels (boutique, produit, liens retirés) et
 * page 404. Sur un téléphone où Ficelle est installée, l'app s'ouvre avant
 * d'afficher cette page : elle ne s'affiche donc que sans l'app, ou sur
 * ordinateur. Mise en scène : un avis de passage, ou un retour à l'envoyeur.
 */
export function AppHandoff({
  title,
  children,
  notice = "Delivery notice",
  stamp = ["Waiting", "in the app"],
  showStore = true,
  secondary = { label: "Back to home", href: "/" },
}: {
  title: string
  children: React.ReactNode
  notice?: string
  stamp?: [string, string]
  showStore?: boolean
  secondary?: { label: string; href: string }
}) {
  return (
    <section className="relative flex min-h-[calc(100svh-5rem)] items-center px-4 pt-6 pb-24 sm:px-6">
      <div className="relative mx-auto w-full max-w-[40rem]">
        <Tape r={-35} className="-top-3 -left-5 w-24 sm:-left-8 sm:w-28" />
        <Tape r={-35} className="-right-4 -bottom-3 w-24 sm:-right-8 sm:w-28" />
        <div className="paper relative -rotate-[1deg] overflow-hidden rounded-[6px]">
          <div className="flex items-stretch justify-between border-b-[3px] border-ink">
            <div className="flex items-center gap-2 px-5 py-3 sm:px-7">
              <Mark className="w-7" />
              <span className="type-field text-[0.75rem] text-ink sm:text-[0.8125rem]">{notice}</span>
            </div>
            <div className="flex items-center bg-ink px-5 text-paper sm:px-7">
              <span className="type-display text-[1.75rem] leading-none tracking-[0.02em] whitespace-nowrap sm:text-[2rem]">
                BLM 00
              </span>
            </div>
          </div>
          <div className="px-5 pt-8 pb-8 sm:px-8 sm:pt-10">
            <h1 className="type-title max-w-[14ch] text-[clamp(2.75rem,9vw,4.25rem)] text-ink">{title}</h1>
            <div className="mt-5 max-w-[42ch] text-[1.125rem] leading-[1.6] text-ink-soft [&_a]:font-semibold [&_a]:text-ink [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-4 [&_a:hover]:decoration-teal [&_p+p]:mt-3">
              {children}
            </div>
            <Stamp r={-6} className="mt-7 text-[1.25rem] sm:hidden">
              {stamp[0]}
              <br />
              {stamp[1]}
            </Stamp>
            <div className="mt-9 flex flex-wrap gap-3">
              {showStore ? (
                <a href={site.appStoreUrl} className={buttonVariants({ size: "lg" })}>
                  <HugeiconsIcon icon={AppleIcon} strokeWidth={2} />
                  Get the app
                </a>
              ) : null}
              <Link
                href={secondary.href}
                className={buttonVariants({ variant: showStore ? "paper" : "default", size: "lg" })}
              >
                {secondary.label}
              </Link>
            </div>
          </div>
          <div className="border-t-2 border-ink/80 px-5 pt-4 pb-3 sm:px-8">
            <Barcode value={title} className="h-12" />
          </div>
          <Stamp r={-10} className="absolute top-[5.5rem] right-4 hidden text-[1.6rem] sm:block">
            {stamp[0]}
            <br />
            {stamp[1]}
          </Stamp>
        </div>
      </div>
    </section>
  )
}
