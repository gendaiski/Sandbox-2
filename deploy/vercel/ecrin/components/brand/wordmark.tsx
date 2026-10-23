"use client"

import { useId } from "react"

import { Mark } from "@/components/brand/logo"
import { cn } from "@/lib/utils"

/** Le symbole or de la marque et le mot « Écrin » en Unbounded. */
export function Wordmark({ className }: { className?: string }) {
  // Identifiant sans caractères spéciaux, utilisable dans url(#…).
  const glintId = "glint" + useId().replace(/[^a-zA-Z0-9_-]/g, "")
  return (
    <span className={cn("inline-flex items-center", "gap-2.5", className)}>
      <Mark className="w-9" glintId={glintId} />
      <span className="font-display text-[1.32rem] leading-none font-[560] tracking-[-0.04em] text-cream">
        Écrin
      </span>
    </span>
  )
}
