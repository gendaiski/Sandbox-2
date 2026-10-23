import Link from "next/link"
import { AppleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  PhoneHandoff,
  RooftopsStrip,
  Signpost,
} from "@/components/illustrations/wayfinding"
import { SiteFooter } from "@/components/site-footer"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"

/**
 * Gabarit commun aux liens d'app (shop, product, liens expirés) et à la 404.
 * Quand l'app est installée, le système l'ouvre directement : ce gabarit ne
 * sert qu'aux visiteurs sans l'app ou sur ordinateur.
 */
export function AppHandoff({
  title,
  children,
  showStore = true,
  lost = false,
  secondary = { label: "Back to home", href: "/" },
}: {
  title: string
  children: React.ReactNode
  showStore?: boolean
  lost?: boolean
  secondary?: { label: string; href: string }
}) {
  return (
    <>
      <main
        id="content"
        className="sky-morning relative flex min-h-svh flex-col"
      >
        <div className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col items-center px-4 pt-[6.5rem] pb-10 text-center sm:px-6 lg:px-8">
          {lost ? (
            <Signpost
              labels={["Home", "FAQ", "Shops"]}
              label="A signpost with arrows pointing to Home, the FAQ and the shops."
              className="h-auto w-[11rem] md:w-[13rem]"
            />
          ) : (
            <PhoneHandoff className="h-auto w-[11rem] md:w-[13rem]" />
          )}
          <h1 className="t-h2 mt-6 max-w-[18ch] text-[clamp(2.4rem,5vw,4rem)] text-ink">
            {title}
          </h1>
          <div className="t-lead mt-5 max-w-[34rem] text-ink-soft [&_p+p]:mt-3">
            {children}
          </div>
          <div className="mt-9 flex w-full flex-wrap justify-center gap-3">
            {showStore ? (
              <a
                href={site.appStoreUrl}
                className={buttonVariants({ size: "lg" })}
              >
                <HugeiconsIcon icon={AppleIcon} strokeWidth={1.8} />
                Get the app
              </a>
            ) : null}
            <Link
              href={secondary.href}
              className={buttonVariants({
                variant: showStore ? "light" : "default",
                size: "lg",
              })}
            >
              {secondary.label}
            </Link>
          </div>
        </div>
        <RooftopsStrip
          lost={lost}
          className="block aspect-[600/120] w-full md:aspect-[1600/200]"
        />
      </main>
      <SiteFooter />
    </>
  )
}
