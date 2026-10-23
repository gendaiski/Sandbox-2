"use client"

import { useEffect, useRef, useState } from "react"

import { Mark } from "@/components/brand/logo"

const stats = [
  { label: "Sales", value: 9, decimals: 0 },
  { label: "Pickups", value: 5, decimals: 0 },
  { label: "Rating", value: 4.9, decimals: 1 },
]

const orders = [
  { name: "Candle and tea écrin", meta: "$32.00", status: "Delivered" },
  { name: "Freshwater pearl bracelet", meta: "$48.00", status: "Paid" },
  { name: "Hand care set", meta: "Écrin Point, Thursday", status: "Waiting" },
]

const number = (value: number, decimals: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

/**
 * Aperçu d'Écrin Pro, avec des données d'exemple. Il s'anime une fois,
 * quand il entre dans l'écran : les compteurs montent, les ventes arrivent,
 * puis une notification de retrait.
 */
export function ProPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const [played, setPlayed] = useState(false)
  const [progress, setProgress] = useState(1)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    // Prêt à jouer : on repart de zéro tant que l'aperçu n'est pas visible.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        setPlayed(true)
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1400)
          setProgress(1 - Math.pow(1 - t, 3))
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        setProgress(0)
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.45 }
    )
    node.dataset.ready = "true"
    io.observe(node)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <figure className="relative">
      <div
        ref={ref}
        data-played={played || undefined}
        className="pro-preview relative rounded-[1.75rem] border border-cream/12 bg-[radial-gradient(110%_70%_at_100%_0%,rgb(197_153_64/0.16),transparent_60%),linear-gradient(180deg,#163432,#0f2526)] p-5 shadow-[0_40px_90px_-40px_rgb(0_0_0/0.85)] sm:p-7"
        aria-hidden="true"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full border border-gold-light/40 bg-night">
            <Mark className="w-5" />
          </span>
          <p className="font-medium text-cream">My shop</p>
          <span className="ml-auto rounded-full border border-cream/15 px-3 py-1 text-xs text-cream/70">
            This week
          </span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col justify-between gap-1.5 rounded-2xl border border-cream/10 bg-night/50 px-3 py-3.5 sm:px-4"
            >
              <p className="text-xs text-cream/60">{stat.label}</p>
              <p className="font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.1rem)] leading-none font-[340] tracking-[-0.04em] text-gold-light tabular-nums">
                {number(stat.value * progress, stat.decimals)}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm text-cream/70">Latest sales</p>
        <ul className="mt-2.5 divide-y divide-cream/8 overflow-hidden rounded-2xl border border-cream/10 bg-night/40">
          {orders.map((order, index) => (
            <li
              key={order.name}
              className="pro-row flex items-center gap-3 px-4 py-3"
              style={{ "--i": index } as React.CSSProperties}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-cream">
                  {order.name}
                </span>
                <span className="text-xs text-cream/60">{order.meta}</span>
              </span>
              <span className="ml-auto shrink-0 rounded-full bg-gold-light/15 px-2.5 py-1 text-[0.6875rem] font-semibold text-gold-light">
                {order.status}
              </span>
            </li>
          ))}
        </ul>

        <div className="pro-toast relative mt-4 rounded-2xl sm:absolute sm:-bottom-7 sm:-left-8 sm:mt-0 sm:w-[17rem] bg-cream p-3.5 text-ink shadow-[0_24px_50px_-18px_rgb(0_0_0/0.8),0_0_0_1px_rgb(197_153_64/0.4)]">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-ink">
              <Mark className="w-4" />
            </span>
            <span className="text-sm font-semibold">Écrin Pro</span>
            <span className="ml-auto text-xs whitespace-nowrap text-ink/60">
              just now
            </span>
          </div>
          <p className="mt-2 text-sm leading-snug">
            Pickup booked: hand care set, Thursday at Velours.
          </p>
        </div>
      </div>
      <figcaption className="mt-4 text-sm text-cream/55 sm:mt-14">
        Écrin Pro, filled with made-up numbers for this preview.
      </figcaption>
    </figure>
  )
}
