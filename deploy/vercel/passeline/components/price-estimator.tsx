"use client"

import { useState } from "react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import {
  estimatePrice,
  formatUsd,
  pricing,
  type DeliveryMode,
} from "@/lib/pricing"
import { cn } from "@/lib/utils"

const modes: { value: DeliveryMode; label: string }[] = [
  { value: "direct", label: "Direct" },
  { value: "neighbor", label: "Neighbor drop" },
]

/** Simulateur de tarif, dessiné comme une étiquette de cadeau. */
export function PriceEstimator({ className }: { className?: string }) {
  const [mode, setMode] = useState<DeliveryMode>("direct")
  const [miles, setMiles] = useState(5)
  const { base, distance, total } = estimatePrice(mode, miles)

  return (
    <div
      className={cn(
        "relative drop-shadow-[0_6px_0_rgb(15_35_36/0.12)]",
        className
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 160 120"
        className="absolute top-1/2 -left-[118px] hidden h-[120px] w-[160px] -translate-y-[62px] lg:block"
      >
        <path
          d="M4 18 C40 4 70 40 92 52 C112 64 132 60 150 62"
          fill="none"
          stroke="#C59940"
          strokeWidth={4}
          strokeLinecap="round"
        />
      </svg>
      <div className="gift-tag grid gap-8 bg-cream px-6 pt-16 pb-8 text-ink sm:px-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-14 lg:py-11 lg:pr-12 lg:pl-24">
        <div>
          <h3 id="estimateur-titre" className="t-h3 text-[1.85rem]">
            What will your trip cost?
          </h3>
          <RadioGroup
            value={mode}
            onValueChange={(value) => setMode(value as DeliveryMode)}
            aria-label="Delivery mode"
            className="mt-6 flex flex-wrap gap-2.5"
          >
            {modes.map((m) => (
              <label
                key={m.value}
                className="flex cursor-pointer items-center gap-3 rounded-full px-5 py-2.5 font-[620] text-ink shadow-[inset_0_0_0_2px_rgb(15_35_36/0.18)] transition-colors duration-150 has-[[data-checked]]:bg-teal-deep has-[[data-checked]]:text-cream has-[[data-checked]]:shadow-none"
              >
                <RadioGroupItem value={m.value} />
                {m.label}
              </label>
            ))}
          </RadioGroup>

          <div className="mt-7">
            <div className="flex items-baseline justify-between gap-4">
              <span id="distance-label" className="t-strong">
                Trip distance
              </span>
              <span className="t-strong text-teal tabular-nums">
                {miles}&nbsp;{miles > 1 ? "miles" : "mile"}
              </span>
            </div>
            <Slider
              value={miles}
              onValueChange={(value) =>
                setMiles(Array.isArray(value) ? value[0] : value)
              }
              min={1}
              max={pricing.maxMiles}
              step={1}
              thumbLabel="Distance in miles"
              className="mt-1"
            />
            <div className="flex justify-between text-[0.9rem] text-ink-soft">
              <span>1&nbsp;mi</span>
              <span>{pricing.maxMiles}&nbsp;mi</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center border-t-2 border-dashed border-[#e2d3ad] pt-7 lg:border-t-0 lg:border-l-2 lg:pt-0 lg:pl-12">
          <p className="text-ink-soft">About</p>
          <p
            aria-live="polite"
            className="t-figure mt-1 text-[clamp(3.25rem,6vw,4.75rem)] text-teal-deep"
          >
            {formatUsd(total)}
          </p>
          <p className="mt-3 text-ink-soft">
            {formatUsd(base)} base + {formatUsd(distance)} for {miles}&nbsp;mi
          </p>
          <p className="mt-5 text-[0.92rem] leading-relaxed text-ink-soft">
            An estimate: the app shows the final price before you confirm. A
            package nobody collects comes back to you for{" "}
            {formatUsd(pricing.returnFee)}. Visa, Mastercard, American Express
            or Apple Pay, through a PCI-DSS certified payment provider.
          </p>
        </div>
      </div>
    </div>
  )
}
