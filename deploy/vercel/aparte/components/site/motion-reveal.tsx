"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

/*
 * Déclencheur des petits mouvements au défilement.
 *
 * Un script en tête de page pose `data-motion` sur <html> (sauf si
 * l'utilisateur a demandé moins d'animations) : les éléments marqués
 * `data-reveal` partent alors de leur état initial. Ce composant leur ajoute
 * `data-revealed` dès qu'ils approchent du bas de l'écran. On vérifie à chaque
 * défilement (y compris un `window.scrollTo` programmé) : un élément déjà
 * dépassé par un saut est révélé lui aussi, jamais laissé caché.
 */
export function MotionReveal() {
  const pathname = usePathname()

  React.useEffect(() => {
    const root = document.documentElement
    if (!root.hasAttribute("data-motion")) return
    root.setAttribute("data-motion", "ready")

    let frame = 0
    const check = () => {
      frame = 0
      const limit = window.innerHeight * 0.88
      const pending = document.querySelectorAll<HTMLElement>(
        "[data-reveal]:not([data-revealed])"
      )
      for (const element of pending) {
        if (element.getBoundingClientRect().top < limit) {
          element.setAttribute("data-revealed", "")
        }
      }
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }

    check()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [pathname])

  return null
}
