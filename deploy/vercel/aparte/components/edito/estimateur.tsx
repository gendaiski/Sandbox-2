"use client"

import { useState } from "react"

import { Slider } from "@/components/ui/slider"
import { estimatePrice, formatUsd, pricing } from "@/lib/pricing"

/** Simulateur discret : une distance en miles, le prix des deux modes. */
export function Estimateur() {
  const [miles, setMiles] = useState(5)
  const inPerson = estimatePrice("inPerson", miles).total
  const setAside = estimatePrice("setAside", miles).total

  return (
    <div className="mt-8">
      <p
        id="estimator-label"
        className="text-[0.875rem] leading-snug text-ink-soft"
      >
        For a trip of{" "}
        <output
          htmlFor="estimator"
          className="serif text-[1.0625rem] text-ink tabular-nums"
        >
          {miles}&nbsp;{miles > 1 ? "miles" : "mile"}
        </output>
      </p>
      <Slider
        id="estimator"
        className="mt-3"
        min={1}
        max={pricing.maxMiles}
        step={1}
        value={[miles]}
        onValueChange={(v) => setMiles(Array.isArray(v) ? v[0] : v)}
        thumbLabel="Distance, in miles"
      />
      <dl
        aria-live="polite"
        className="mt-4 flex flex-wrap gap-x-8 gap-y-1 text-[0.875rem] text-ink-soft"
      >
        <div className="flex items-baseline gap-2">
          <dt>In person</dt>
          <dd className="serif text-[1.25rem] text-ink tabular-nums">
            {formatUsd(inPerson)}
          </dd>
        </div>
        <div className="flex items-baseline gap-2">
          <dt>Set aside</dt>
          <dd className="serif text-[1.25rem] text-ink tabular-nums">
            {formatUsd(setAside)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
