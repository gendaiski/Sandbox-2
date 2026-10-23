import Link from "next/link"

import { GiftBox } from "@/components/gift-box"
import { AppStoreLink } from "@/components/site/app-store-link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Page de repli des liens universels (boutique, produit, liens retirés) et
 * page 404. Sur un iPhone où l'app Écrin est installée, iOS l'ouvre avant
 * d'afficher cette page : elle ne s'affiche donc que sans l'app, ou sur
 * ordinateur.
 */
export function AppHandoff({
  title,
  children,
  showStore = true,
  emptyBox = false,
  secondary = { label: "Back to home", href: "/" },
}: {
  title: string
  children: React.ReactNode
  showStore?: boolean
  /** La boîte ouverte et vide, pour la page introuvable. */
  emptyBox?: boolean
  secondary?: { label: string; href: string }
}) {
  return (
    <section className="relative overflow-hidden px-(--gutter)">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_22rem_at_50%_16rem,rgb(197_153_64/0.22),rgb(197_153_64/0.05)_55%,transparent),radial-gradient(70%_60%_at_50%_0%,rgb(18_63_59/0.8),transparent_70%)]"
      />
      <div className="relative mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center pt-28 pb-20 text-center">
        <div className="relative h-[12.5rem] w-full" aria-hidden="true">
          <div
            className="absolute top-[64%] left-1/2"
            style={
              {
                "--w": "116px",
                "--open": emptyBox ? 0.62 : 0,
              } as React.CSSProperties
            }
          >
            <GiftBox className="gbox--rest" />
          </div>
        </div>
        <h1 className="mt-8 font-display text-[clamp(2rem,1.4rem+2.6vw,3.25rem)] leading-[1.05] font-[400] tracking-[-0.035em] text-balance text-cream">
          {title}
        </h1>
        <div className="lead mt-6 [&_a]:font-medium [&_a]:text-gold-light [&_a]:underline [&_a]:underline-offset-4 [&_p+p]:mt-3">
          {children}
        </div>
        <div className="mt-10 flex w-full flex-wrap justify-center gap-3">
          {showStore ? <AppStoreLink /> : null}
          <Link
            href={secondary.href}
            className={cn(
              buttonVariants({
                variant: showStore ? "outline" : "default",
                size: "lg",
              })
            )}
          >
            {secondary.label}
          </Link>
        </div>
      </div>
    </section>
  )
}
