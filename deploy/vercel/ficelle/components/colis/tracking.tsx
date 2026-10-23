import Image from "next/image"

import { SampleQr } from "./barcode"
import { Stamp, Tape } from "./stamp"

const handSteps = [
  {
    name: "Wrapped",
    text: "A photo of the gift, the address, the delivery type: three screens in the app, and the final price shows up before you pay.",
    stamp: "Wrapped",
    r: -7,
  },
  {
    name: "Picked up",
    text: "An independent courier, ID-checked by us, swings by to collect the package.",
    stamp: "Picked up",
    r: 5,
  },
  {
    name: "On the way",
    text: "Their dot moves across the map in the app. Your recipient still has no idea who’s thinking of them.",
    stamp: "On the way",
    r: -4,
  },
  {
    name: "Delivered",
    text: "Your recipient reads out the 4-digit code we texted them; the courier enters it and the handoff is confirmed.",
    stamp: "Delivered by hand",
    r: -9,
  },
]

const dropOffSteps = [
  {
    name: "At the drop-off shop",
    text: "The courier leaves the parcel with a shop in your recipient’s neighborhood.",
  },
  {
    name: "A link by text",
    text: "Your recipient learns a parcel is waiting for them, and at which shop.",
  },
  {
    name: "They say yes",
    text: "One tap on the link is all it takes to accept the package.",
  },
  {
    name: "Pickup",
    text: "They stop by within 5\u00a0days and give their code; the shop hands over the parcel.",
  },
]

export function Tracking() {
  return (
    <section id="how-it-works" aria-labelledby="how-it-works-title" className="relative scroll-mt-6 pb-24 lg:pb-36">
      <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
        {/* Ligne de découpe entre deux sections */}
        <div aria-hidden="true" className="mb-16 flex items-center gap-3 text-ink/55 lg:mb-20">
          <svg viewBox="0 0 24 24" className="size-6 -rotate-90" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M8.6 7.5L20 18M8.6 16.5L20 6" />
          </svg>
          <div className="cut-line flex-1" />
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 id="how-it-works-title" className="type-title text-[clamp(3.5rem,11vw,7.5rem)] text-ink">
              The journey.
            </h2>
            <p className="mt-6 max-w-[44ch] text-[1.125rem] leading-[1.55] lg:text-[1.1875rem]">
              Every stop along the way gets its own stamp, live in the app. Changed your
              mind? Canceling is free until the courier has the package in hand.
            </p>
          </div>
          <figure className="tape-lift relative mx-auto w-[13.5rem] rotate-[3deg] bg-paper p-3 pb-10 shadow-[0_14px_24px_-12px_rgb(60_38_12/0.6)] sm:w-[17rem] lg:col-span-4 lg:col-start-9 lg:mr-6">
            <Tape r={-6} className="-top-3 left-1/2 w-24 -translate-x-1/2" />
            <Image
              src="/images/livreur.jpg"
              alt="A smiling courier holding a kraft-paper parcel in each hand."
              width={775}
              height={896}
              sizes="(min-width: 640px) 16rem, 14rem"
              className="aspect-[4/4.4] w-full object-cover"
            />
            <figcaption className="mt-3 text-center text-[0.9375rem] text-ink-soft">
              Independent couriers, every one of them vetted.
            </figcaption>
          </figure>
        </div>

        <div className="mt-14 grid gap-12 lg:mt-20 xl:grid-cols-12 xl:gap-0">
          {/* Feuille de suivi By hand */}
          <article
            aria-labelledby="tracking-by-hand"
            className="paper relative z-10 rounded-[3px] lg:-rotate-[0.6deg] xl:col-start-1 xl:col-end-8 xl:row-start-1 xl:self-start"
          >
            <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b-[3px] border-ink px-5 pt-6 pb-4 sm:px-8">
              <div>
                <p className="type-field text-ink/70">Parcel tracking</p>
                <h3 id="tracking-by-hand" className="type-title mt-1 text-[2.75rem] sm:text-[3.25rem]">
                  By hand
                </h3>
              </div>
              <p className="font-mono text-[0.875rem] tracking-[0.12em]">
                <span className="type-field mr-2 text-ink/70">No.</span>FC 4821 0030 US
              </p>
            </header>
            <ol className="relative">
              {handSteps.map((step, i) => (
                <li
                  key={step.name}
                  className="relative grid grid-cols-[2.5rem_1fr] gap-x-4 border-b border-dashed border-ink/30 px-5 py-6 last:border-b-0 sm:grid-cols-[3rem_1fr_13rem] sm:px-8"
                >
                  <span
                    aria-hidden="true"
                    className="grid size-10 place-items-center rounded-full border-2 border-ink font-mono text-[0.9375rem] font-semibold sm:size-11"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="type-heading text-[1.75rem] sm:text-[2rem]">{step.name}</h4>
                    <p className="mt-1.5 max-w-[46ch] text-[1.0625rem] leading-[1.55] text-ink-soft">
                      {step.text}
                    </p>
                    {i === handSteps.length - 1 && (
                      <div className="mt-5 max-w-[22rem] rounded-[1.1rem] rounded-bl-[0.3rem] bg-[#e9e6dc] px-4 py-3 text-[0.9375rem] leading-[1.45] text-ink shadow-[inset_0_0_0_1px_rgb(15_35_36/0.08)]">
                        <p className="type-field mb-1 text-ink/70">Sample text</p>
                        <p>
                          Ficelle: someone tied up a gift for you. Code for your courier:{" "}
                          <span className="font-mono font-semibold tracking-[0.2em]">4821</span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="col-start-2 mt-4 flex items-center sm:col-start-3 sm:mt-0 sm:justify-center">
                    {/* Chaque étape reçoit son coup de tampon en arrivant à l'écran */}
                    <Stamp r={step.r} className="text-[1.75rem]" reveal={0}>
                      {step.stamp === "Delivered by hand" ? (
                        <>
                          Delivered
                          <br />
                          by hand
                        </>
                      ) : (
                        step.stamp
                      )}
                    </Stamp>
                  </div>
                </li>
              ))}
            </ol>
            <Stamp
              r={7}
              tone="deep"
              reveal={0}
              className="absolute -top-7 right-4 hidden text-[1.6rem] sm:block lg:-right-8"
            >
              Fragile: gift inside
            </Stamp>
          </article>

          {/* Variante Drop-off, agrafée à côté */}
          <article
            aria-labelledby="tracking-drop-off"
            className="kraft-pale relative self-start rounded-[3px] shadow-[0_14px_24px_-12px_rgb(60_38_12/0.6)] lg:ml-auto lg:w-[34rem] lg:rotate-[2deg] xl:col-start-8 xl:col-end-13 xl:row-start-1 xl:mt-32 xl:-ml-6 xl:w-auto"
            style={{ zIndex: 20 }}
          >
            <span
              aria-hidden="true"
              className="absolute -top-2 left-10 h-4 w-10 rounded-[2px] border-2 border-[#8d939a] bg-[#c9ced3] shadow-[0_1px_1px_rgb(0_0_0/0.3)]"
            />
            <header className="border-b-2 border-ink px-5 pt-7 pb-4 sm:px-7">
              <p className="type-field text-ink/70">Option</p>
              <h3 id="tracking-drop-off" className="type-title mt-1 text-[2.5rem]">
                Drop-off
              </h3>
              <p className="mt-2 text-[1rem] leading-[1.5] text-ink-soft">
                Not home during the day? A shop nearby holds the parcel.
              </p>
            </header>
            <ol className="px-5 py-2 sm:px-7">
              {dropOffSteps.map((step, i) => (
                <li key={step.name} className="grid grid-cols-[2rem_1fr] gap-x-3 border-b border-dashed border-ink/30 py-4 last:border-b-0">
                  <span aria-hidden="true" className="pt-1 font-mono text-[0.875rem] font-semibold">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <div>
                    <h4 className="type-heading text-[1.375rem]">{step.name}</h4>
                    <p className="mt-1 text-[1rem] leading-[1.5] text-ink-soft">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="flex items-center gap-4 border-t-2 border-ink px-5 py-5 sm:px-7">
              <div className="w-24 shrink-0 bg-paper p-1.5">
                <SampleQr className="w-full" />
              </div>
              <div>
                <Stamp r={-6} className="text-[1.5rem]" reveal={0}>
                  Good for
                  <br />
                  5&nbsp;days
                </Stamp>
                <p className="mt-3 text-[0.9375rem] leading-[1.45] text-ink-soft">
                  Not picked up within 5&nbsp;days, or declined: it goes back to the sender
                  ($7 return fee).
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
