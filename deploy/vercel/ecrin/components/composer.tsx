"use client"

import { useId, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  DeliveryBox01Icon,
  QrCodeIcon,
  Store01Icon,
} from "@hugeicons/core-free-icons"

import { Magnetic } from "@/components/motion/magnetic"
import { SpringUsd } from "@/components/motion/spring-usd"
import { AppStoreLink } from "@/components/site/app-store-link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import {
  estimatePrice,
  formatUsd,
  modeNames,
  pricing,
  type DeliveryMode,
} from "@/lib/pricing"
import { cn } from "@/lib/utils"

const modes: {
  value: DeliveryMode
  name: string
  text: string
  icon: typeof DeliveryBox01Icon
}[] = [
  {
    value: "handover",
    name: modeNames.handover,
    text: "Placed in their hands by a vetted courier.",
    icon: DeliveryBox01Icon,
  },
  {
    value: "point",
    name: modeNames.point,
    text: "Held at a local shop or a neighbor’s place.",
    icon: Store01Icon,
  },
]

export function Composer() {
  const [mode, setMode] = useState<DeliveryMode>("handover")
  const [miles, setMiles] = useState(4)
  const [name, setName] = useState("Maya")
  const ids = { miles: useId(), name: useId(), mode: useId() }

  const price = estimatePrice(mode, miles)
  const who = name.trim() || "Your recipient"
  const whoLower = name.trim() || "your recipient"

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
      {/* Réglages */}
      <form
        className="flex flex-col gap-9"
        aria-label="Delivery settings"
        onSubmit={(e) => e.preventDefault()}
      >
        <fieldset className="flex flex-col gap-3.5">
          <legend id={ids.mode} className="mb-3.5 text-[0.9375rem] font-medium text-cream">
            Delivery option
          </legend>
          <RadioGroup
            aria-labelledby={ids.mode}
            value={mode}
            onValueChange={(v) => setMode(v as DeliveryMode)}
            className="grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {modes.map((m) => (
              <label
                key={m.value}
                className="group/mode relative flex cursor-pointer flex-col gap-3 rounded-2xl border border-cream/14 bg-night/40 p-5 transition-[border-color,background-color] duration-200 hover:border-cream/30 has-data-checked:border-gold-light/70 has-data-checked:bg-[linear-gradient(160deg,rgb(197_153_64/0.16),rgb(197_153_64/0.03))] has-focus-visible:outline-2 has-focus-visible:outline-offset-3 has-focus-visible:outline-gold-light"
              >
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    <HugeiconsIcon
                      icon={m.icon}
                      strokeWidth={1.6}
                      className="size-5 text-teal-glow group-has-data-checked/mode:text-gold-light"
                    />
                    <span className="font-display text-[1.125rem] font-[480] tracking-[-0.02em]">
                      {m.name}
                    </span>
                  </span>
                  <RadioGroupItem value={m.value} className="focus-visible:outline-none" />
                </span>
                <span className="text-[0.9375rem] leading-snug text-cream/72">
                  {m.text}
                </span>
                <span className="text-sm text-cream/60">
                  {formatUsd(pricing.base[m.value])} base fare
                </span>
              </label>
            ))}
          </RadioGroup>
        </fieldset>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-4">
            <Label id={ids.miles}>Delivery distance</Label>
            <output
              aria-hidden="true"
              className="font-display text-[1.375rem] font-[420] tracking-[-0.02em] text-cream tabular-nums"
            >
              {miles}&nbsp;mi
            </output>
          </div>
          <Slider
            aria-labelledby={ids.miles}
            value={[miles]}
            min={1}
            max={pricing.maxMiles}
            step={1}
            thumbLabel="Delivery distance in miles"
            getAriaValueText={(_, v) => (v === 1 ? "1 mile" : v + " miles")}
            onValueChange={(v) => setMiles(Array.isArray(v) ? v[0] : v)}
          />
          <p className="flex justify-between text-sm text-cream/55">
            <span>1&nbsp;mi</span>
            <span>{pricing.maxMiles}-mile radius</span>
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor={ids.name}>Recipient’s first name</Label>
          <Input
            id={ids.name}
            value={name}
            maxLength={24}
            autoComplete="off"
            spellCheck={false}
            placeholder="For example, Maya"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </form>

      {/* Aperçu en direct */}
      <div className="relative flex flex-col overflow-hidden rounded-[2rem] border border-cream/10 bg-[radial-gradient(90%_70%_at_50%_0%,rgb(197_153_64/0.22),rgb(197_153_64/0)_70%),linear-gradient(180deg,#143533,#0f2827)]">
        <div className="flex flex-1 flex-col px-6 pt-8 pb-8 sm:px-10 sm:pt-10">
          <p className="text-[0.9375rem] text-cream/70">
            What <span className="text-cream">{whoLower}</span> gets
          </p>

          <div className="relative mt-6 min-h-[17rem]">
            <Preview key={mode} mode={mode} who={who} />
          </div>
        </div>

        <div className="border-t border-cream/10 bg-night/40 px-6 py-7 sm:px-10">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
            <div aria-live="polite" aria-atomic="true">
              <p className="text-[0.9375rem] text-cream/70">Estimated price</p>
              <p className="mt-1 font-display text-[clamp(2.5rem,1.9rem+2.4vw,3.5rem)] leading-none font-[360] tracking-[-0.04em] text-gold-light tabular-nums">
                <SpringUsd value={price.total} />
              </p>
              <p className="mt-2.5 text-sm text-cream/65">
                {formatUsd(price.base)} base fare + {formatUsd(price.distance)} for{" "}
                {miles}&nbsp;mi
              </p>
            </div>
            <Magnetic>
              <AppStoreLink size="default">Send with the app</AppStoreLink>
            </Magnetic>
          </div>
          <p className="mt-5 text-sm text-cream/55">
            Estimate only. The app shows the final amount before you confirm
            anything.
          </p>
        </div>
      </div>
    </div>
  )
}

function Preview({ mode, who }: { mode: DeliveryMode; who: string }) {
  if (mode === "handover") {
    return (
      <div className="composer-swap flex flex-col gap-5">
        <div className="max-w-[22rem] rounded-[1.6rem] border border-cream/8 bg-[#1d3c3a] p-5 shadow-[0_24px_60px_-30px_rgb(0_0_0/0.8)]">
          <p className="flex items-center justify-between text-[0.8125rem] text-cream/60">
            <span className="flex items-center gap-2 font-medium text-cream/85">
              <HugeiconsIcon icon={QrCodeIcon} strokeWidth={1.7} className="size-4" />
              Packaging scanned
            </span>
            <span>on opening</span>
          </p>
          <p className="mt-3 rounded-[1.1rem] rounded-bl-[0.35rem] bg-cream px-4 py-3 text-[1.0625rem] leading-snug text-ink">
            “Love you, even on Mondays.”{" "}
            <span className="font-display font-semibold">Paul</span>
          </p>
        </div>
        <p className="max-w-[26rem] text-[0.9375rem] leading-relaxed text-cream/75">
          The courier hands the écrin to {who}, who scans the QR code printed
          on it. Your note and your name show up right then, not a second
          sooner.
        </p>
      </div>
    )
  }

  return (
    <ol className="composer-swap flex flex-col gap-4">
      <li className="flex gap-4">
        <StepMark n={1} />
        <div className="min-w-0 flex-1 rounded-[1.4rem] border border-cream/8 bg-[#1d3c3a] p-4">
          <p className="flex items-center gap-2 text-[0.8125rem] text-cream/65">
            <HugeiconsIcon icon={Calendar03Icon} strokeWidth={1.7} className="size-4" />
            {who} picks a pickup day
          </p>
          <p className="mt-2 text-[1.0625rem] leading-snug text-cream">
            Thursday, at Velours on Mariners’ Quay
          </p>
          <p className="mt-2.5 flex items-center gap-2 text-[0.8125rem] text-cream/65">
            <span className="flex gap-1" aria-hidden="true">
              <span className="size-2 rounded-full bg-gold-light" />
              <span className="size-2 rounded-full bg-gold-light" />
              <span className="size-2 rounded-full bg-gold-light" />
            </span>
            {pricing.pickupDays}&nbsp;days to stop by
          </p>
        </div>
      </li>
      <li className="flex gap-4">
        <StepMark n={2} />
        <div className="flex min-w-0 flex-1 items-center gap-4 rounded-[1.4rem] border border-cream/8 bg-[#1d3c3a] p-4">
          <FakeQr className="size-[5.5rem] shrink-0 rounded-lg bg-cream p-1.5" />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[0.8125rem] text-cream/65">
              <HugeiconsIcon icon={QrCodeIcon} strokeWidth={1.7} className="size-4" />
              Pickup code
            </p>
            <p className="mt-1.5 font-display text-[1.25rem] font-[440] tracking-[-0.02em] text-gold-light">
              Valid {pricing.pickupDays}&nbsp;days
            </p>
            <p className="mt-1 text-[0.875rem] leading-snug text-cream/70">
              Shown at the Écrin Point. If no one comes, the écrin returns to you.
            </p>
          </div>
        </div>
      </li>
    </ol>
  )
}

function StepMark({ n }: { n: number }) {
  return (
    <span
      className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full border border-gold-light/50 font-display text-[0.8125rem] text-gold-light"
      aria-hidden="true"
    >
      {n}
    </span>
  )
}

/** An illustrative QR code (fixed pattern, points nowhere). */
function FakeQr({ className }: { className?: string }) {
  const size = 21
  const cells: [number, number][] = []
  let seed = 7
  const rand = () => {
    seed = (seed * 16807) % 2147483647
    return seed / 2147483647
  }
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > 12 && y < 8) || (x < 8 && y > 12)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!inFinder(x, y) && rand() > 0.52) cells.push([x, y])
    }
  }
  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="#0F2324" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#F9F6ED" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#0F2324" />
    </g>
  )
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={cn(className)} aria-hidden="true" shapeRendering="crispEdges">
      {cells.map(([x, y]) => (
        <rect key={`${x}.${y}`} x={x} y={y} width={1} height={1} fill="#0F2324" />
      ))}
      {finder(0, 0)}
      {finder(14, 0)}
      {finder(0, 14)}
    </svg>
  )
}
