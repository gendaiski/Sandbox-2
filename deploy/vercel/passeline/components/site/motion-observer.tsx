"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Déclenche les animations liées au défilement : chaque élément
 * `[data-animate]` reçoit `[data-inview]` la première fois qu'il entre dans
 * l'écran, y compris lors d'un défilement programmé (`window.scrollTo`).
 * Les états « avant » ne s'appliquent qu'avec JavaScript
 * (`@media (scripting: enabled)`) : sans script, tout reste dans son état
 * final.
 */
export function MotionObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute("data-inview", "")
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.3 }
    )
    document
      .querySelectorAll("[data-animate]:not([data-inview])")
      .forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [pathname])

  return null
}
