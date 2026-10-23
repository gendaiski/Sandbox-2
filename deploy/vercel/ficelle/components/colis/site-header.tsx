import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { AppleIcon } from "@hugeicons/core-free-icons"

import { Logo } from "@/components/brand/logo"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import { MobileMenu } from "./mobile-menu"
import { NavLinks } from "./nav-links"

export function SiteHeader() {
  return (
    <header className="relative z-30">
      <div className="mx-auto flex h-20 max-w-[86rem] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label="Ficelle, home" className="rounded-[3px]">
          <Logo />
        </Link>
        <nav aria-label="Main navigation" className="hidden lg:block">
          <NavLinks />
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={site.appStoreUrl}
            className={buttonVariants({ size: "sm", className: "hidden min-[380px]:inline-flex" })}
          >
            <HugeiconsIcon icon={AppleIcon} strokeWidth={2} />
            Get the app
          </a>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
