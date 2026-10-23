"use client"

import { Fragment, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PauseIcon, PlayIcon } from "@hugeicons/core-free-icons"

import { Mark } from "@/components/brand/logo"
import { Button } from "@/components/ui/button"

const shops = [
  { name: "Velours", detail: "beauty bar on Mariners’ Quay" },
  { name: "Institut Néroli", detail: "by appointment, Aurigny Heights" },
  { name: "La Maison Écrin", detail: "our own curated écrins" },
]

const occasions = ["Love you", "Nailed it", "Sorry", "Hang in there", "Just because"]

function ShopsGroup({ hidden }: { hidden?: boolean }) {
  return (
    <ul className="marquee__group" aria-hidden={hidden || undefined}>
      {shops.map((shop) => (
        <li key={shop.name} className="flex items-center gap-(--gap)">
          <span className="flex items-baseline gap-3 whitespace-nowrap">
            <span className="font-display text-[clamp(2.25rem,1.4rem+3.6vw,5rem)] leading-none font-[300] tracking-[-0.04em] text-cream">
              {shop.name}
            </span>
            <span className="text-[0.9375rem] text-cream/60">{shop.detail}</span>
          </span>
          <Mark className="w-10 opacity-80" />
        </li>
      ))}
    </ul>
  )
}

function OccasionsGroup({ hidden }: { hidden?: boolean }) {
  // Deux passages par groupe pour couvrir les écrans larges ; le second est
  // masqué quand le défilement est coupé.
  return (
    <ul className="marquee__group" aria-hidden={hidden || undefined}>
      {[0, 1].map((pass) =>
        occasions.map((o) => (
          <Fragment key={`${o}-${pass}`}>
            <li
              data-dup={pass ? "" : undefined}
              aria-hidden={pass ? true : undefined}
              className="font-display text-[clamp(1.5rem,1.1rem+1.8vw,2.75rem)] leading-none font-[260] tracking-[-0.03em] whitespace-nowrap text-gold-light"
            >
              {o}
            </li>
            <li
              aria-hidden="true"
              data-dup={pass ? "" : undefined}
              className="size-1.5 shrink-0 rounded-full bg-gold/60"
            />
          </Fragment>
        ))
      )}
    </ul>
  )
}

/** Boutiques et occasions en bande défilante, en pause au survol. */
export function ShopsMarquee() {
  const [paused, setPaused] = useState(false)

  return (
    <div className="relative flex flex-col gap-6 md:gap-8">
      <div className="marquee" data-paused={paused}>
        <div className="marquee__track" style={{ "--dur": "56s" } as React.CSSProperties}>
          <ShopsGroup />
          <ShopsGroup hidden />
        </div>
      </div>
      <div className="marquee" data-paused={paused}>
        <div
          className="marquee__track"
          data-reverse=""
          style={{ "--dur": "60s" } as React.CSSProperties}
        >
          <OccasionsGroup />
          <OccasionsGroup hidden />
        </div>
      </div>
      <div className="marquee__toggle flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPaused((p) => !p)}
          className="text-cream/70 hover:text-cream"
        >
          <HugeiconsIcon icon={paused ? PlayIcon : PauseIcon} strokeWidth={1.8} />
          {paused ? "Resume scrolling" : "Pause scrolling"}
        </Button>
      </div>
    </div>
  )
}
