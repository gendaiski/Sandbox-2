"use client"

import * as React from "react"

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Balancement amorti d'une étiquette pendue à sa ficelle (Web Animations,
 * propriété `transform` seule). Le pivot est le `transform-origin` de
 * l'élément ; `direction` donne le sens de la première poussée.
 */
export function swing(element: HTMLElement, direction: 1 | -1 = 1, amplitude = 6) {
  if (reducedMotion()) return
  const running = element
    .getAnimations()
    .some((animation) => animation.id === "swing" && animation.playState === "running")
  if (running) return
  const a = amplitude * direction
  const ease = "cubic-bezier(0.37, 0, 0.63, 1)"
  const animation = element.animate(
    [
      { transform: "rotate(0deg)", easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" },
      { transform: `rotate(${a}deg)`, offset: 0.16, easing: ease },
      { transform: `rotate(${-a * 0.62}deg)`, offset: 0.38, easing: ease },
      { transform: `rotate(${a * 0.36}deg)`, offset: 0.58, easing: ease },
      { transform: `rotate(${-a * 0.18}deg)`, offset: 0.76, easing: ease },
      { transform: `rotate(${a * 0.07}deg)`, offset: 0.9, easing: ease },
      { transform: "rotate(0deg)" },
    ],
    { duration: 1150 }
  )
  animation.id = "swing"
}

/**
 * Étiquette qui se balance au survol. `axis` : « x » pour une étiquette
 * pendue par le haut (poussée de gauche ou de droite), « y » pour une
 * étiquette accrochée par le côté (poussée du dessus ou du dessous).
 */
export function Swing({
  children,
  className,
  axis = "x",
  amplitude = 6,
}: {
  children: React.ReactNode
  className?: string
  axis?: "x" | "y"
  amplitude?: number
}) {
  return (
    <div
      className={className}
      onPointerEnter={(event) => {
        const box = event.currentTarget.getBoundingClientRect()
        const direction =
          axis === "x"
            ? event.clientX < box.left + box.width / 2
              ? -1
              : 1
            : event.clientY < box.top + box.height / 2
              ? 1
              : -1
        swing(event.currentTarget, direction, amplitude)
      }}
    >
      {children}
    </div>
  )
}
