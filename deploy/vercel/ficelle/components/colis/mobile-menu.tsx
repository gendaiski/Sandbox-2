"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { AppleIcon, Menu02Icon } from "@hugeicons/core-free-icons"

import { buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { mainNav, site } from "@/lib/site"

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger
        className={buttonVariants({ variant: "paper", size: "icon", className: "lg:hidden" })}
        aria-label="Open menu"
      >
        <HugeiconsIcon icon={Menu02Icon} strokeWidth={2} />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader className="border-b-2 border-dashed border-ink/30 pt-8">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Gifts delivered across Bellmere and 15&nbsp;miles around.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="px-6 py-4">
          <ul className="flex flex-col">
            {mainNav.map((item) => (
              <li key={item.href} className="border-b border-ink/15">
                <SheetClose
                  render={<Link href={item.href} />}
                  nativeButton={false}
                  className="type-heading block py-4 text-2xl text-ink"
                >
                  {item.label}
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto p-6">
          <a href={site.appStoreUrl} className={buttonVariants({ size: "lg", className: "w-full" })}>
            <HugeiconsIcon icon={AppleIcon} strokeWidth={2} />
            Get the app
          </a>
        </div>
      </SheetContent>
    </Sheet>
  )
}
