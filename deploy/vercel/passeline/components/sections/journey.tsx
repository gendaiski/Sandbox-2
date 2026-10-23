import type { ComponentType } from "react"

import {
  SceneCarry,
  SceneChoose,
  SceneCode,
  SceneUnwrap,
} from "@/components/illustrations/step-scenes"
import { JourneyTrack } from "@/components/journey-track"
import { cn } from "@/lib/utils"

const steps: {
  title: string
  text: string
  Scene: ComponentType<{ className?: string }>
}[] = [
  {
    title: "You get it ready",
    text: "Pick a gift from a Wrenhaven shop in the app, or hand over a package you wrapped yourself. Direct or Neighbor drop: the full price, distance included, shows up before you confirm.",
    Scene: SceneChoose,
  },
  {
    title: "A courier or a relay neighbor",
    text: "With Direct, a vetted courier takes it, by cargo bike whenever the route allows. With Neighbor drop, it waits in the living room of a vetted neighbor two streets from the recipient. The app shows every step.",
    Scene: SceneCarry,
  },
  {
    title: "A signature or a QR code",
    text: "With Direct, the recipient signs on the courier’s screen. With Neighbor drop, they get a text, pick a time slot to stop by, then collect the package with a QR code that’s good for 4 days.",
    Scene: SceneCode,
  },
  {
    title: "The bow comes undone",
    text: "The package is in their hands. What’s left is the best part of the trip, the one no app can do for you: pulling the ribbon.",
    Scene: SceneUnwrap,
  },
]

export function Journey() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="sky-day relative scroll-mt-4"
    >
      <JourneyTrack className="mx-auto max-w-[1240px] px-4 pt-16 pb-28 sm:px-6 md:pt-24 md:pb-36 lg:px-8">
        <span
          data-route-start
          aria-hidden="true"
          className="absolute top-0 left-1/2 block size-0"
        />
        <span
          data-bend
          aria-hidden="true"
          className="absolute top-14 left-[37px] block size-0 sm:left-[45px] md:hidden"
        />
        <div className="max-w-[30rem] max-md:pl-[58px] md:max-w-[min(30rem,calc(50%-4.5rem))]">
          <h2
            id="how-it-works-title"
            className="t-h2 text-[clamp(2.75rem,5.4vw,4.75rem)] text-ink"
          >
            How a gift travels
          </h2>
          <p className="t-lead mt-5 text-ink-soft">
            From your table to their doorstep: four stops, joined by one golden
            line.
          </p>
        </div>

        <ol className="mt-10 grid gap-16 md:mt-24 md:gap-28">
          {steps.map(({ title, text, Scene }, i) => {
            const flip = i % 2 === 1
            return (
              <li
                key={title}
                className="relative grid grid-cols-[42px_1fr] gap-x-4 md:grid-cols-[minmax(0,1fr)_132px_minmax(0,1fr)] md:items-center md:gap-x-0"
              >
                <div
                  className={cn(
                    "col-start-2 row-start-1 md:row-start-1",
                    flip ? "md:col-start-3" : "md:col-start-1"
                  )}
                >
                  <Scene className="h-auto w-full max-w-[520px] md:mx-auto" />
                </div>
                <div
                  className={cn(
                    "col-start-1 row-span-2 row-start-1 flex justify-center pt-6 md:col-start-2 md:row-span-1 md:items-center md:pt-0"
                  )}
                >
                  <span
                    data-waypoint
                    className="milestone relative z-[2] grid h-[50px] w-[42px] place-items-center rounded-t-full rounded-b-[8px] bg-tuffeau text-[1.35rem] text-teal-deep shadow-[0_4px_0_#cdb98b] data-reached:bg-gold-light md:h-[64px] md:w-[54px] md:text-[1.7rem]"
                  >
                    <span className="t-figure pt-1.5">{i + 1}</span>
                  </span>
                </div>
                <div
                  className={cn(
                    "col-start-2 row-start-2 mt-6 md:row-start-1 md:mt-0 md:max-w-[29rem]",
                    flip
                      ? "md:col-start-1 md:justify-self-end"
                      : "md:col-start-3"
                  )}
                >
                  <h3 className="t-h3 text-[clamp(1.6rem,2.4vw,2.15rem)] text-ink">
                    {title}
                  </h3>
                  <p className="mt-3 text-ink-soft">{text}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="journey-fallback absolute top-[84px] bottom-[-56px] left-[20px] border-l-[5px] border-dotted border-gold md:top-[calc(50%+40px)] md:bottom-[calc(-50%-72px)] md:left-1/2 md:-ml-[2px]"
                />
              </li>
            )
          })}
        </ol>
        <span
          data-route-end
          aria-hidden="true"
          className="absolute bottom-0 left-[37px] block size-0 sm:left-[45px] md:left-1/2"
        />
      </JourneyTrack>
    </section>
  )
}
