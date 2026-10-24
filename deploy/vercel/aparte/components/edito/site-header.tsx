import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { Container } from "@/components/edito/primitives"
import { MainNav, MobileMenu } from "@/components/edito/site-nav"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  return (
    <header className="relative z-20">
      <Container className="flex h-[4.5rem] items-center justify-between gap-4 lg:h-20">
        <Link
          href="/"
          aria-label="Aparté, home"
          className="-mx-1 rounded-sm px-1"
        >
          <Logo className="[&_svg]:h-[1.875rem] [&>span:last-child]:text-[1.5rem] lg:[&>span:last-child]:text-[1.625rem]" />
        </Link>

        <MainNav />

        <div className="flex items-center gap-2">
          <a
            href={site.appStoreUrl}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "hidden sm:inline-flex"
            )}
          >
            Get the app
          </a>
          <MobileMenu />
        </div>
      </Container>
    </header>
  )
}
