"use client"

import { useRef, useState } from "react"

import { Mark } from "@/components/brand/logo"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { estimatePrice, formatUsd, pricing, type DeliveryMode } from "@/lib/pricing"
import { swing } from "@/components/motion/swing"
import { cn } from "@/lib/utils"
import { Barcode } from "./barcode"
import { Stamp, Tape } from "./stamp"

const modes: {
  value: DeliveryMode
  name: string
  promise: string
  body: string
  tilt: string
}[] = [
  {
    value: "by-hand",
    name: "By hand",
    promise: "Handed over by a courier",
    body: "A vetted courier rings the bell and hands over the parcel. You can stay anonymous until it’s opened, and a 4-digit code sent by text confirms the delivery.",
    tilt: "lg:-rotate-[2.5deg] lg:mt-36 lg:[--twine:9.5rem]",
  },
  {
    value: "drop-off",
    name: "Drop-off",
    promise: "At a shop down the street",
    body: "The parcel waits at a drop-off shop a couple of blocks from your recipient. They get a link, say yes, then pick it up with a code that’s good for 5 days.",
    tilt: "lg:rotate-[2deg] lg:mt-24 lg:[--twine:6.5rem]",
  },
]

/** Brin de ficelle entre l'œillet de l'étiquette et le ruban. */
function Twine({ flip, className }: { flip?: boolean; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute -top-[6.5rem] left-1/2 z-20 h-[7.5rem] w-[7.5rem] -translate-x-1/2 lg:-top-[var(--twine)] lg:h-[calc(var(--twine)+1rem)]",
        flip && "-scale-x-100",
        className
      )}
      fill="none"
      strokeLinecap="round"
    >
      <path d="M60 112 C 40 80, 78 52, 52 0" stroke="#5c4123" strokeWidth="3.2" vectorEffect="non-scaling-stroke" />
      <path d="M60 112 C 40 80, 78 52, 52 0" stroke="#d9bd8c" strokeWidth="1.2" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
      <path d="M60 112 C 76 88, 46 60, 70 0" stroke="#5c4123" strokeWidth="3.2" vectorEffect="non-scaling-stroke" />
      <path d="M60 112 C 76 88, 46 60, 70 0" stroke="#d9bd8c" strokeWidth="1.2" strokeDasharray="3 5" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export function ChooseShipment() {
  const [mode, setMode] = useState<DeliveryMode>("by-hand")
  const [miles, setMiles] = useState(5)
  // Incrémenté à chaque changement : le ticket « réimprime » son total et
  // le lecteur repasse sur le code-barres (rien au premier affichage).
  const [reprint, setReprint] = useState(0)
  const tags = useRef<Partial<Record<DeliveryMode, HTMLDivElement | null>>>({})
  const price = estimatePrice(mode, miles)
  const current = modes.find((m) => m.value === mode)!

  return (
    <section id="pricing" aria-labelledby="pricing-title" className="relative isolate scroll-mt-6 pt-10 pb-24 lg:pb-32">
      <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="pricing-title" className="type-title text-[clamp(3.5rem,11vw,7.5rem)] text-ink lg:col-span-7">
            Choose your delivery.
          </h2>
          <p className="max-w-[40ch] text-[1.125rem] leading-[1.55] text-ink lg:col-span-5 lg:pb-3 lg:text-[1.1875rem]">
            Two tags, one receipt. Tie on the one that suits you, slide the distance and
            read the total. In the app, the final price always shows up before you
            pay.
          </p>
        </div>
      </div>

      {/* Le ruban or traverse la section ; les étiquettes y sont nouées */}
      <div aria-hidden="true" className="ribbon-band relative z-0 mt-12 h-11 w-full -rotate-[0.6deg] lg:mt-16 lg:h-12" />

      <div className="mx-auto grid max-w-[86rem] grid-cols-[minmax(0,1fr)] gap-x-10 gap-y-14 px-4 sm:px-6 lg:px-10 xl:grid-cols-12">
        <RadioGroup
          aria-label="Delivery type"
          value={mode}
          onValueChange={(value) => {
            const next = value as DeliveryMode
            setMode(next)
            setReprint((count) => count + 1)
            // L'étiquette choisie se balance sur sa ficelle
            const tag = tags.current[next]
            if (tag) swing(tag, next === "by-hand" ? -1 : 1, 5)
          }}
          className="grid gap-x-8 gap-y-24 self-start pt-20 sm:grid-cols-2 lg:pt-0 xl:col-span-7"
        >
          {modes.map((m, i) => (
            <label
              key={m.value}
              className={cn(
                "group/tag relative block cursor-pointer transition-[translate,rotate] duration-200 ease-(--ease-out) hover:-translate-y-1 has-data-checked:-translate-y-2 has-data-checked:rotate-0",
                m.tilt
              )}
            >
              <Twine flip={i === 1} className={i > 0 ? "hidden sm:block" : undefined} />
              {/* Au survol, l'étiquette se balance autour de son œillet */}
              <div
                ref={(node) => {
                  tags.current[m.value] = node
                }}
                onPointerEnter={(event) => {
                  const box = event.currentTarget.getBoundingClientRect()
                  swing(event.currentTarget, event.clientX < box.left + box.width / 2 ? -1 : 1, 6)
                }}
                className="relative z-10 origin-top drop-shadow-[0_14px_14px_rgb(60_38_12/0.35)] transition-[filter] duration-200 group-hover/tag:drop-shadow-[0_20px_18px_rgb(60_38_12/0.4)]"
              >
                <div
                  className="kraft-pale @container relative flex min-h-full flex-col px-6 pt-6 pb-0 text-ink [clip-path:polygon(22%_0,78%_0,100%_9%,100%_100%,0_100%,0_9%)] [mask:radial-gradient(circle_11px_at_0_calc(100%-6.25rem),#0000_98%,#000)_,radial-gradient(circle_11px_at_100%_calc(100%-6.25rem),#0000_98%,#000)] [mask-composite:intersect] sm:px-7"
                >
                  {/* Liseré teal quand l'étiquette est choisie */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-2 border-2 border-transparent transition-colors duration-200 [clip-path:polygon(22%_0,78%_0,100%_9%,100%_100%,0_100%,0_9%)] group-has-data-checked/tag:border-teal"
                  />
                  <div className="flex justify-center">
                    <RadioGroupItem value={m.value} aria-describedby={`tag-${m.value}-body`} />
                  </div>
                  <p className="type-display mt-7 text-[min(27cqi,6.5rem)] leading-[0.82] uppercase lg:mt-10">
                    {m.name}
                  </p>
                  <p className="type-heading mt-3 text-[1.375rem] text-ink">{m.promise}</p>
                  <p id={`tag-${m.value}-body`} className="mt-4 mb-9 text-[1.0625rem] leading-[1.55] text-ink-soft lg:mb-12">
                    {m.body}
                  </p>
                  {/* Perforation */}
                  <div aria-hidden="true" className="cut-line -mx-7 text-ink/45" />
                  <div className="flex h-[6.25rem] flex-col justify-center font-mono text-ink">
                    <span className="type-field text-ink/70">Starting price</span>
                    <span className="mt-1 text-[1.0625rem] font-semibold">
                      {formatUsd(pricing.base[m.value])} + {formatUsd(pricing.perMile)}/mi
                    </span>
                  </div>
                </div>
                <Stamp
                  r={i === 0 ? -14 : 10}
                  className="absolute right-3 bottom-[1.6rem] z-20 scale-150 text-[1.5rem] opacity-0 transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.3,0.7,0.3,1.4)] group-has-data-checked/tag:scale-100 group-has-data-checked/tag:opacity-100"
                >
                  Picked
                </Stamp>
              </div>
            </label>
          ))}
        </RadioGroup>

        {/* Le ticket de caisse qui recalcule */}
        <div className="tape-lift relative lg:mt-4 xl:col-span-5 xl:-mt-14">
          <Tape r={3} className="-top-3 left-1/2 w-28 -translate-x-1/2" />
          <div className="mx-auto max-w-[23rem] rotate-[1.2deg] drop-shadow-[0_14px_14px_rgb(60_38_12/0.35)]">
            <div className="zigzag bg-paper px-6 pt-10 pb-10 font-mono text-[0.875rem] leading-[1.6] text-ink">
              <div className="flex flex-col items-center gap-1 text-center">
                <Mark className="w-9" />
                <p className="text-[1rem] font-semibold tracking-[0.2em] uppercase">Ficelle</p>
                <p className="text-[0.8125rem]">Gifts brought to the door</p>
                <p className="text-[0.8125rem]">Bellmere and 15&nbsp;miles around</p>
              </div>

              <p aria-hidden="true" className="my-4 overflow-hidden whitespace-nowrap text-ink/60">
                {"- ".repeat(40)}
              </p>

              <p className="text-center text-[0.8125rem] font-semibold tracking-[0.18em] uppercase">
                Estimate
              </p>

              <div className="mt-4">
                <div className="flex items-baseline justify-between">
                  <span className="uppercase">Distance</span>
                  <span className="font-semibold">{miles}&nbsp;mi</span>
                </div>
                <Slider
                  className="mt-1"
                  min={1}
                  max={pricing.maxMiles}
                  step={1}
                  value={[miles]}
                  onValueChange={(value) => {
                    setMiles(Array.isArray(value) ? value[0] : value)
                    setReprint((count) => count + 1)
                  }}
                  thumbLabel="Miles to your recipient"
                  getAriaValueText={(_, value) => value + " miles"}
                />
                <div aria-hidden="true" className="flex justify-between text-[0.75rem] text-ink/70">
                  <span>1&nbsp;mi</span>
                  <span>{pricing.maxMiles}&nbsp;mi</span>
                </div>
              </div>

              <p aria-hidden="true" className="my-4 overflow-hidden whitespace-nowrap text-ink/60">
                {"- ".repeat(40)}
              </p>

              <dl className="space-y-1">
                <div className="flex justify-between gap-4">
                  <dt className="uppercase">Service</dt>
                  <dd className="uppercase">{current.name}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="uppercase">Base</dt>
                  <dd>{formatUsd(price.base)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>
                    {miles}&nbsp;mi × {formatUsd(pricing.perMile)}
                  </dt>
                  <dd>{formatUsd(price.distance)}</dd>
                </div>
              </dl>

              <p aria-hidden="true" className="my-3 overflow-hidden whitespace-nowrap text-ink">
                {"=".repeat(60)}
              </p>

              <div className="flex items-baseline justify-between gap-4" aria-live="polite" aria-atomic="true">
                <span className="text-[0.9375rem] font-semibold uppercase">Estimated total</span>
                <span className="text-[1.75rem] leading-none font-semibold">
                  <span key={reprint} className={reprint ? "anim-tick" : undefined}>
                    {formatUsd(price.total)}
                  </span>
                </span>
              </div>

              <p aria-hidden="true" className="my-4 overflow-hidden whitespace-nowrap text-ink/60">
                {"- ".repeat(40)}
              </p>

              <ul className="space-y-1.5 text-[0.8125rem] leading-[1.5]">
                <li>Pickup included. A heavy package may cost a little more.</li>
                <li>Final price shown before you pay.</li>
                <li>Return to sender, if needed: {formatUsd(pricing.returnFee)}.</li>
                <li>Visa, Mastercard, Amex or Apple Pay.</li>
              </ul>

              <Barcode
                value={mode + "-" + miles}
                className="mt-6 h-12"
                scan={reprint ? { key: reprint } : undefined}
              />
              <p className="mt-2 text-center text-[0.8125rem]">Thanks, and see you at the next knot.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

