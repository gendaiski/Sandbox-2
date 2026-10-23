import {
  SceneModeDirect,
  SceneModeNeighbor,
} from "@/components/illustrations/mode-scenes"
import { PriceEstimator } from "@/components/price-estimator"
import { formatUsdShort, pricing } from "@/lib/pricing"
import { typo } from "@/lib/typo"

/** La ligne d'or qui bifurque, une branche par mode ; elle se déroule vers le bas. */
function Fork() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="fork-route pointer-events-none absolute inset-x-0 -top-6 -bottom-6 hidden h-[calc(100%+3rem)] w-full md:block lg:-bottom-8 lg:h-[calc(100%+3.5rem)]"
    >
      <g fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke">
        <path
          d="M50 0 V62 C50 82 25 80 25 100 M50 62 C50 82 75 80 75 100"
          stroke="#FFFFFF"
          strokeOpacity={0.4}
          strokeWidth={26}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M50 0 V62 C50 82 25 80 25 100 M50 62 C50 82 75 80 75 100"
          stroke="#C59940"
          strokeWidth={6}
          strokeDasharray="0 17"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </svg>
  )
}

const modeCards = [
  {
    id: "direct",
    Scene: SceneModeDirect,
    title: "Direct, right to the door",
    text: "A vetted courier carries your gift across town, by cargo bike when the route allows. At the door, the recipient signs on the courier’s screen and the handoff is logged.",
    base: pricing.base.direct,
  },
  {
    id: "neighbor",
    Scene: SceneModeNeighbor,
    title: "Neighbor drop, around the corner",
    text: "Your package waits with a vetted relay neighbor. The recipient gets a text, books a time to stop by and leaves with the package using a QR code that’s good for 4 days. If no one comes, it goes back to you.",
    base: pricing.base.neighbor,
  },
] as const

export function Modes() {
  return (
    <section
      id="pricing"
      aria-labelledby="modes-title"
      className="sky-golden relative scroll-mt-4"
    >
      <div className="relative mx-auto max-w-[1240px] px-4 pt-6 pb-28 sm:px-6 md:pb-36 lg:px-8">
        <div className="relative pb-14 md:pb-24" data-animate="">
          <Fork />
          <div className="relative max-w-[30rem] md:max-w-[min(30rem,calc(50%-4.5rem))]">
            <h2
              id="modes-title"
              className="t-h2 text-[clamp(2.75rem,5.4vw,4.75rem)] text-ink"
            >
              Two ways to arrive
            </h2>
            <p className="t-lead mt-5 text-ink-soft">
              Handed over at the door or kept around the corner: you decide
              where the line ends.
            </p>
          </div>
        </div>

        <div className="relative grid gap-x-12 gap-y-16 md:grid-cols-2">
          {modeCards.map(({ id, Scene, title, text, base }) => (
            <article key={id} aria-labelledby={`mode-${id}`}>
              <Scene className="mx-auto h-auto w-full max-w-[560px]" />
              <div className="mx-auto mt-4 max-w-[30rem]">
                <h3
                  id={`mode-${id}`}
                  className="t-h3 text-[clamp(1.65rem,2.4vw,2.1rem)] text-ink"
                >
                  {title}
                </h3>
                <p className="mt-3 text-ink-soft">{text}</p>
                <p className="t-strong mt-4 text-teal-deep">
                  {typo(
                    `From ${formatUsdShort(base)}, plus ${formatUsdShort(pricing.perMile)} a mile`
                  )}
                </p>
              </div>
            </article>
          ))}
        </div>

        <PriceEstimator className="mt-20 lg:ml-[118px]" />
      </div>
    </section>
  )
}
