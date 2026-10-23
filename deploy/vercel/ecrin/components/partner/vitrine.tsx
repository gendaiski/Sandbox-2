import type { CSSProperties } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  FlowerIcon,
  GiftCardIcon,
} from "@hugeicons/core-free-icons"

import { GiftBox } from "@/components/gift-box"
import { PointerTilt } from "@/components/motion/pointer-tilt"
import { cn } from "@/lib/utils"

const items = [
  {
    icon: FlowerIcon,
    name: "Dried bouquet",
    end: false,
    detail: "$34.00",
    action: "Gift it",
    // gauche, un peu en retrait
    style: { "--fx": "-0.74", "--fy": "0.02", "--fz": "0.02", "--fr": "-6deg", "--i": 0 },
  },
  {
    icon: Calendar03Icon,
    name: "Thursday pickup",
    end: false,
    detail: "At Velours",
    action: "Pick",
    style: { "--fx": "0", "--fy": "-0.14", "--fz": "0.42", "--fr": "0deg", "--i": 1 },
  },
  {
    icon: GiftCardIcon,
    name: "Tea and honey",
    end: true,
    detail: "$36.00",
    action: "Add",
    style: { "--fx": "0.74", "--fy": "0.06", "--fz": "0.02", "--fr": "6deg", "--i": 2 },
  },
]

/**
 * La boîte Écrin devient une vitrine : le couvercle se lève au chargement et
 * trois fiches d'une boutique (exemples) en sortent. Tout en CSS, figé avec
 * « réduire les animations ». Les cartes se penchent vers le curseur.
 */
export function Vitrine() {
  return (
    <PointerTilt className="vitrine" aria-hidden="true">
      <div className="vitrine__halo" />
      <div className="vitrine__anchor">
        <GiftBox>
          {items.map((item) => (
            <div
              key={item.name}
              className="vitrine-card"
              style={item.style as CSSProperties}
            >
              <div
                className={cn(
                  "flex size-full flex-col justify-between rounded-[1em] bg-cream p-[0.9em] text-ink shadow-[0_0_0_1px_rgb(197_153_64/0.45),0_1.4em_2.8em_-1em_rgb(227_190_107/0.55)]",
                  item.end && "items-end text-right"
                )}
              >
                <span className="flex size-[2.2em] items-center justify-center rounded-full bg-teal text-cream">
                  <HugeiconsIcon icon={item.icon} strokeWidth={1.7} className="size-[1.2em]" />
                </span>
                <span className="block">
                  <span className="block leading-tight font-semibold">{item.name}</span>
                  <span
                    className={cn(
                      "mt-[0.2em] flex items-center justify-between gap-[0.4em]",
                      item.end && "flex-row-reverse"
                    )}
                  >
                    <span className="text-[0.86em] text-ink/70">{item.detail}</span>
                    <span className="rounded-full bg-[#e7f0ec] px-[0.55em] py-[0.15em] text-[0.74em] font-semibold text-teal">
                      {item.action}
                    </span>
                  </span>
                </span>
              </div>
            </div>
          ))}
        </GiftBox>
      </div>
    </PointerTilt>
  )
}
