"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

/**
 * Révèle au défilement les éléments marqués `data-reveal` (tampons qui
 * s'abattent, autocollants posés, ticket imprimé). Seuls les éléments encore
 * sous la ligne de flottaison au chargement sont « armés » (masqués) ; les
 * autres restent tels quels. Écoute l'événement `scroll`, donc fonctionne
 * aussi avec `window.scrollTo`. Rien n'est armé si l'utilisateur préfère
 * réduire les animations. Quand plusieurs éléments passent la ligne dans la
 * même image, ils s'enchaînent à 90 ms d'écart (les tampons tombent un à un).
 */
export function RevealOnScroll() {
  const pathname = usePathname()

  React.useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const line = () => window.innerHeight * 0.86
    let armed = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]")).filter(
      (element) => {
        const box = element.getBoundingClientRect()
        if (box.width === 0 && box.height === 0) return false
        if (box.top <= line()) return false
        element.setAttribute("data-armed", "")
        return true
      }
    )

    let frame = 0
    const check = () => {
      frame = 0
      const limit = line()
      let order = 0
      armed = armed.filter((element) => {
        if (element.getBoundingClientRect().top > limit) return true
        element.style.setProperty("--reveal-stagger", `${order++ * 90}ms`)
        element.removeAttribute("data-armed")
        element.setAttribute("data-shown", "")
        return false
      })
      if (!armed.length) stop()
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check)
    }
    const stop = () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    check()
    return () => {
      stop()
      if (frame) cancelAnimationFrame(frame)
      for (const element of armed) element.removeAttribute("data-armed")
    }
  }, [pathname])

  return null
}
