import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkBadge01Icon,
  Motorbike01Icon,
  QrCodeIcon,
  Store01Icon,
} from "@hugeicons/core-free-icons"

import { estimatePrice, formatUsd } from "@/lib/pricing"
import { cn } from "@/lib/utils"

export type PromiseKind = "verified" | "qr" | "price"

const example = estimatePrice("handover", 4)

/**
 * Les petits objets qui sortent de la boîte : une illustration par promesse.
 * Tailles en em : la carte suit la taille de police de son conteneur.
 */
export function PromiseToken({
  kind,
  className,
}: {
  kind: PromiseKind
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex size-full flex-col justify-center rounded-[1.1em] bg-cream px-[1.1em] py-[0.9em] text-ink shadow-[0_0_0_1px_rgb(197_153_64/0.45),0_1.6em_3em_-1.2em_rgb(227_190_107/0.55)]",
        className
      )}
    >
      {kind === "verified" && <Verified />}
      {kind === "qr" && <Reveal />}
      {kind === "price" && <Price />}
    </div>
  )
}

function Verified() {
  const rows = [
    { icon: Motorbike01Icon, name: "Marcus", role: "courier" },
    { icon: Store01Icon, name: "Velours", role: "Écrin Point" },
  ]
  return (
    <ul className="flex flex-col gap-[0.55em]">
      {rows.map((row) => (
        <li key={row.name} className="flex items-center gap-[0.6em]">
          <span className="flex size-[2.1em] shrink-0 items-center justify-center rounded-full bg-teal text-cream">
            <HugeiconsIcon icon={row.icon} strokeWidth={1.7} className="size-[1.15em]" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block font-semibold">{row.name}</span>
            <span className="block text-[0.82em] text-ink/70">{row.role}</span>
          </span>
          <span className="inline-flex items-center gap-[0.25em] rounded-full bg-[#e7f0ec] px-[0.55em] py-[0.2em] text-[0.78em] font-semibold text-teal">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} strokeWidth={2} className="size-[1.1em]" />
            Verified
          </span>
        </li>
      ))}
    </ul>
  )
}

function Reveal() {
  return (
    <div className="flex flex-col gap-[0.45em]">
      <p className="flex items-center justify-between text-[0.8em] text-ink/65">
        <span className="inline-flex items-center gap-[0.35em] font-semibold text-ink">
          <HugeiconsIcon icon={QrCodeIcon} strokeWidth={1.8} className="size-[1.1em]" />
          Écrin QR scanned
        </span>
        <span>just now</span>
      </p>
      <p className="rounded-[1em] rounded-bl-[0.3em] bg-[#e9e4d6] px-[0.9em] py-[0.6em] text-[1.02em] leading-snug">
        “Nailed the audition!”{" "}
        <span className="font-display font-semibold">Paul</span>
      </p>
    </div>
  )
}

function Price() {
  return (
    <div className="flex flex-col gap-[0.2em]">
      <p className="text-[0.82em] text-ink/70">Handover, 4&nbsp;mi</p>
      <p className="font-display text-[2.1em] leading-none font-medium tracking-[-0.03em]">
        {formatUsd(example.total)}
      </p>
      <p className="mt-[0.35em] inline-flex items-center gap-[0.4em] text-[0.82em] font-semibold text-teal">
        <HugeiconsIcon icon={CheckmarkBadge01Icon} strokeWidth={2} className="size-[1.15em]" />
        Priced before you confirm
      </p>
    </div>
  )
}
