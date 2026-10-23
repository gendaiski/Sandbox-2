import type { VariantProps } from "class-variance-authority"
import { HugeiconsIcon } from "@hugeicons/react"
import { AppleIcon } from "@hugeicons/core-free-icons"

import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

/** Main link: download the Écrin app from the App Store. */
export function AppStoreLink({
  className,
  size = "lg",
  variant = "default",
  children = "Get the app",
}: {
  className?: string
  children?: React.ReactNode
} & VariantProps<typeof buttonVariants>) {
  return (
    <a
      href={site.appStoreUrl}
      className={cn(buttonVariants({ size, variant }), className)}
    >
      <HugeiconsIcon icon={AppleIcon} strokeWidth={1.8} data-icon="inline-start" />
      {children}
      <span className="sr-only"> on the App Store</span>
    </a>
  )
}
