"use client"

import { useEffect, useRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

import { AppStoreLink } from "@/components/site/app-store-link"
import { GiftBox } from "@/components/gift-box"
import { Magnetic } from "@/components/motion/magnetic"
import { PromiseToken, type PromiseKind } from "@/components/promise-token"
import { buttonVariants } from "@/components/ui/button"
import { typo } from "@/lib/typo"

const promises: { kind: PromiseKind; title: string; text: string }[] = [
  {
    kind: "verified",
    title: "Vetted hands at every step",
    text: "Our independent couriers show a photo ID before their very first run. Écrin Points, whether a local shop or a neighbor, pass the same check before they hold a single package.",
  },
  {
    kind: "qr",
    title: "A note that waits to be opened",
    text: "Every box carries a printed QR code. Your recipient scans it, and only then do your note and your name appear. Until that moment, the mystery holds.",
  },
  {
    kind: "price",
    title: "The total, up front",
    text: "$5.75 for a Handover, $3.50 for an Écrin Point, plus $1.75 a mile. The app prices the trip down to the cent before you confirm a thing.",
  },
]

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))

/**
 * Le hero et les trois promesses partagent une même scène collante : la boîte
 * tourne doucement, son couvercle se soulève au défilement et chaque promesse
 * en sort à son tour. Sans JS ou avec « réduire les animations », la boîte
 * reste fermée et immobile, et les promesses s'affichent avec leur
 * illustration dans le texte.
 */
export function OpeningScene() {
  const sceneRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scene = sceneRef.current
    const stage = stageRef.current
    if (!scene || !stage) return

    const hero = scene.querySelector<HTMLElement>("[data-hero]")
    const blocks = Array.from(
      scene.querySelectorAll<HTMLElement>("[data-promise] .promise__text")
    )
    const cards = Array.from(stage.querySelectorAll<HTMLElement>(".gbox__card"))
    if (!hero) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const wide = window.matchMedia("(min-width: 1024px)")
    let raf = 0
    let running = false
    let inView = true
    let last = 0
    let yaw = -34
    let open = 0
    const rise = cards.map(() => 0)
    const exit = cards.map(() => 0)
    let heroTop = 0
    let anchor = 0.5
    // La boîte se penche vers le curseur, sur un ressort souple.
    const lean = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }
    let spans: { top: number; height: number }[] = []

    const measure = () => {
      const y = window.scrollY
      heroTop = hero.getBoundingClientRect().top + y
      // Sur mobile, le texte d'une promesse se lit dans le bas de l'écran
      anchor = wide.matches ? 0.5 : 0.7
      spans = blocks.map((b) => {
        const r = b.getBoundingClientRect()
        return { top: r.top + y, height: r.height }
      })
    }

    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016
      last = now
      const vh = window.innerHeight
      const y = window.scrollY
      const k = 1 - Math.exp(-dt * 6.5)

      open += (clamp((y - heroTop) / (vh * 0.6)) - open) * k
      // Le texte du hero s'efface avant de passer devant la boîte
      const fadeSpan = wide.matches ? 0.38 : 0.24
      hero.style.setProperty(
        "--fade",
        clamp(1 - (y - heroTop - vh * 0.06) / (vh * fadeSpan)).toFixed(3)
      )
      yaw = (yaw + dt * (15 - 10 * open)) % 360
      lean.vx += ((lean.tx - lean.x) * 38 - lean.vx * 8) * dt
      lean.vy += ((lean.ty - lean.y) * 38 - lean.vy * 8) * dt
      lean.x += lean.vx * dt
      lean.y += lean.vy * dt

      spans.forEach((s, i) => {
        if (!cards[i]) return
        const d = (s.top + s.height / 2 - y - vh * anchor) / vh
        const r = clamp((0.62 - d) / 0.5)
        const e = i < spans.length - 1 ? clamp((-d - 0.12) / 0.32) : 0
        rise[i] += (r - rise[i]) * k
        exit[i] += (e - exit[i]) * k
        cards[i].style.setProperty("--rise", rise[i].toFixed(4))
        cards[i].style.setProperty("--exit", exit[i].toFixed(4))
      })

      const lid = open > 0.06 ? "back" : "front"
      if (stage.dataset.lid !== lid) stage.dataset.lid = lid
      stage.style.setProperty("--open", open.toFixed(4))
      stage.style.setProperty("--yaw", `${(yaw + lean.x * 16).toFixed(2)}deg`)
      stage.style.setProperty("--lean-y", lean.y.toFixed(4))
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || !inView || reduce.matches) return
      running = true
      last = 0
      raf = requestAnimationFrame(frame)
    }
    const stop = () => {
      running = false
      cancelAnimationFrame(raf)
    }

    const applyMode = () => {
      if (reduce.matches) {
        stop()
        scene.dataset.motion = "static"
        stage.style.removeProperty("--open")
        stage.style.removeProperty("--yaw")
        stage.style.removeProperty("--lean-y")
        delete stage.dataset.lid
        hero.style.removeProperty("--fade")
      } else {
        scene.dataset.motion = "live"
        measure()
        start()
      }
    }

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView) start()
      else stop()
    })
    io.observe(scene)

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return
      lean.tx = clamp(event.clientX / window.innerWidth, 0, 1) * 2 - 1
      lean.ty = clamp(event.clientY / window.innerHeight, 0, 1) * 2 - 1
    }
    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget) return
      lean.tx = 0
      lean.ty = 0
    }

    const ro = new ResizeObserver(() => measure())
    ro.observe(scene)
    window.addEventListener("resize", measure)
    window.addEventListener("pointermove", onPointer, { passive: true })
    document.addEventListener("pointerout", onPointerOut)
    reduce.addEventListener("change", applyMode)
    applyMode()

    return () => {
      stop()
      io.disconnect()
      ro.disconnect()
      window.removeEventListener("resize", measure)
      window.removeEventListener("pointermove", onPointer)
      document.removeEventListener("pointerout", onPointerOut)
      reduce.removeEventListener("change", applyMode)
    }
  }, [])

  return (
    <div ref={sceneRef} className="scene" data-motion="static">
      <div ref={stageRef} className="stage" aria-hidden="true">
        <div className="stage__vignette" />
        <div className="stage__anchor">
          <div className="stage__halo" />
          <div className="stage__beam" />
          <div className="reveal-box absolute top-0 left-0">
            <GiftBox>
              {promises.map((p) => (
                <div key={p.kind} className="gbox__card">
                  <PromiseToken kind={p.kind} />
                </div>
              ))}
            </GiftBox>
          </div>
        </div>
      </div>

      <div className="scene__content relative z-10 -mt-[100svh]">
        <Hero />
        <section
          id="promises"
          aria-labelledby="promises-title"
          className="scene__promises"
        >
          {promises.map((p, i) => (
            <article key={p.kind} data-promise className="promise">
              <div className="promise__text">
                {i === 0 && (
                  <h2
                    id="promises-title"
                    className="mb-5 font-display text-[1.0625rem] font-[380] tracking-[-0.01em] text-gold-light"
                  >
                    What’s inside every écrin
                  </h2>
                )}
                <h3 className="heading text-[clamp(1.85rem,1.2rem+2.4vw,3.4rem)]">
                  {typo(p.title)}
                </h3>
                <p className="lead mt-5 max-w-[34rem]">{typo(p.text)}</p>
                <div className="scene__token mt-8 w-[17.5rem] text-[15px] sm:w-[19rem]">
                  <div className="h-[9.6rem]">
                    <PromiseToken kind={p.kind} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section data-hero aria-labelledby="hero-title" className="hero">
      <h1 id="hero-title" className="hero__title display">
        <span className="hero__l1 reveal-line">
          <span className="lit-text">wrapped</span>
        </span>
        <span className="hero__l2 reveal-line" style={{ "--d": "140ms" } as React.CSSProperties}>
          <span className="lit-text">in mystery</span>
        </span>
      </h1>
      <div className="hero__aside reveal-fade" style={{ "--d": "380ms" } as React.CSSProperties}>
        <p className="lead max-w-[30rem] text-cream/82">
          Écrin carries your gifts across Vantry, straight into their hands or
          through an Écrin Point. Your note stays sealed until the box is
          opened.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Magnetic>
            <AppStoreLink />
          </Magnetic>
          <Magnetic strength={0.24}>
            <a className={buttonVariants({ variant: "outline", size: "lg" })} href="#pricing">
              Estimate a delivery
            </a>
          </Magnetic>
        </div>
        <p className="mt-4 text-sm text-cream/60">
          Vantry, Ohio, and 10&nbsp;miles around.
        </p>
      </div>
      <p className="scene__cue hero__cue reveal-fade" style={{ "--d": "900ms" } as React.CSSProperties}>
        <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.8} className="size-4" />
        Scroll down, the lid lifts
      </p>
    </section>
  )
}
