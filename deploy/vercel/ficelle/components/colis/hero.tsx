import type { CSSProperties } from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { AppleIcon } from "@hugeicons/core-free-icons"

import { Mark } from "@/components/brand/logo"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import { Barcode } from "./barcode"
import { Postmark, Stamp, Tape } from "./stamp"

function Field({
  name,
  children,
  className,
}: {
  name: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <dt className="type-field text-ink/70">{name}</dt>
      <dd className="mt-1.5 font-mono text-base leading-snug font-medium text-ink sm:text-[1.1875rem]">
        {children}
      </dd>
    </div>
  )
}

function Box({ checked, children }: { checked?: boolean; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="relative inline-block size-[1.05em] shrink-0 border-2 border-ink"
      >
        {checked && (
          <svg viewBox="0 0 10 10" className="absolute inset-0 size-full" stroke="currentColor" strokeWidth="1.6">
            <path d="M1 1l8 8M9 1l-8 8" />
          </svg>
        )}
      </span>
      {children}
    </span>
  )
}

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate">
      {/* Le ruban or qui ceinture le colis, en diagonale */}
      <div
        aria-hidden="true"
        className="ribbon-band pointer-events-none absolute top-[24rem] left-[-20vw] -z-10 h-14 w-[140vw] -rotate-[17deg] sm:top-[22rem] lg:top-[22rem] lg:left-[-10vw] lg:h-16 lg:w-[120vw] lg:-rotate-[9deg]"
      />

      <div className="mx-auto grid max-w-[86rem] gap-x-10 gap-y-12 px-4 pt-4 pb-20 sm:px-6 lg:grid-cols-12 lg:px-10 lg:pt-8 lg:pb-28">
        {/* L'étiquette d'expédition, pièce maîtresse */}
        <div className="anim-label relative lg:col-span-8 [--label-rot:-1.2deg] lg:[--label-rot:-1.8deg]">
          <Tape r={-38} delay={820} className="-top-3 -left-6 w-24 sm:-left-8 sm:w-28" />
          <Tape r={-34} delay={900} className="-right-3 -bottom-3 w-24 sm:-right-5 sm:-bottom-3 sm:w-28" />

          <article
            className="paper anim-jolt @container relative overflow-hidden rounded-[6px] border border-ink/10"
            aria-label="Ficelle shipping label"
          >
            {/* En-tête de l'étiquette */}
            <div className="flex items-stretch justify-between border-b-[3px] border-ink">
              <div className="flex items-center gap-2 px-4 py-3 sm:px-6">
                <Mark className="w-7 sm:w-8" />
                <span className="type-field text-[0.75rem] text-ink sm:text-[0.8125rem]">
                  Gift parcel
                </span>
              </div>
              <div className="flex items-center gap-3 border-l-[3px] border-ink bg-ink px-4 text-paper sm:px-6">
                <span className="type-field hidden text-paper/80 sm:inline">Zone</span>
                <span className="type-display text-[2rem] leading-none tracking-[0.02em] sm:text-[2.6rem]">
                  BLM 00
                </span>
              </div>
            </div>

            {/* Le titre, imprimé comme le gros code de tri */}
            <div className="border-b-[3px] border-ink px-4 pt-5 pb-4 sm:px-6 sm:pt-7 sm:pb-5">
              <h1
                id="hero-title"
                className="type-display text-[22cqi] text-ink uppercase sm:text-[23.5cqi]"
              >
                <span className="block">Hand</span>
                <span className="block">to heart.</span>
              </h1>
            </div>

            {/* Champs */}
            <dl className="grid grid-cols-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)_auto]">
              <Field name="From" className="border-r-2 border-b-2 border-ink/80 px-4 py-4 sm:px-6">
                you
              </Field>
              <Field name="To" className="border-b-2 border-ink/80 px-4 py-4 sm:border-r-2 sm:px-6">
                someone who matters
                <br />
                Bellmere
              </Field>
              <div className="relative row-span-2 hidden flex-col items-center justify-center gap-2 border-b-2 border-ink/80 px-5 py-4 sm:flex">
                <dt className="type-field order-last max-w-[9rem] text-center text-[0.625rem] text-ink/75">
                  Scan for the app
                </dt>
                <dd>
                  <Image
                    src="/images/qr-app-store.svg"
                    alt="QR code linking to the Ficelle source code on GitHub"
                    width={132}
                    height={132}
                    unoptimized
                    className="size-[7.5rem] lg:size-[8.25rem]"
                  />
                </dd>
              </div>
              <Field name="Service" className="border-r-2 border-b-2 border-ink/80 px-4 py-4 sm:px-6 sm:max-md:px-4 lg:max-xl:px-4">
                <span className="flex flex-col gap-1 whitespace-nowrap sm:max-md:text-[0.9375rem] lg:max-xl:text-[0.9375rem]">
                  <Box checked>By hand</Box>
                  <Box>Drop-off</Box>
                </span>
              </Field>
              <Field name="Code" className="border-b-2 border-ink/80 px-4 py-4 sm:border-r-2 sm:px-6">
                <span className="sr-only">4 8 2 1</span>
                <span className="mt-0.5 flex gap-1.5">
                  {["4", "8", "2", "1"].map((d, i) => (
                    <span
                      key={d}
                      aria-hidden="true"
                      className="grid h-10 w-8 place-items-center border-2 border-ink text-[1.375rem] font-semibold sm:h-11 sm:w-9"
                    >
                      {/* Le code se tape touche par touche, après le coup de tampon */}
                      <span className="anim-key" style={{ "--d": `${1500 + i * 95}ms` } as CSSProperties}>
                        {d}
                      </span>
                    </span>
                  ))}
                </span>
              </Field>
            </dl>

            {/* Code-barres */}
            <div className="relative px-4 pt-4 pb-3 sm:px-6">
              <Barcode value="FC4821-0030-US-BELLMERE" className="h-14 sm:h-16" scan={{ key: "load", delay: 1950 }} />
              <p className="mt-1.5 flex justify-between font-mono text-[0.8125rem] tracking-[0.18em] text-ink">
                <span>FC 4821 0030 US</span>
              </p>
            </div>

            <Stamp
              r={-9}
              className="anim-stamp absolute top-[4.4rem] right-3 text-[5cqi] sm:top-[6.5rem] sm:right-8 sm:text-[3.6cqi]"
            >
              Delivered
              <br />
              by hand
            </Stamp>
          </article>
        </div>

        {/* Ce que fait Ficelle, et les deux actions */}
        <div className="relative flex flex-col justify-end lg:col-span-4 lg:pb-6">
          <Postmark
            className="anim-stamp -mt-4 mb-4 w-48 self-end [--d:1380ms] sm:w-56 lg:absolute lg:top-0 lg:left-0 lg:m-0 lg:w-64 lg:self-auto"
            r={-8}
          />
          <p className="max-w-[34ch] text-[1.1875rem] leading-[1.55] text-ink lg:text-[1.25rem]">
            Got a gift for someone in Bellmere or within 15&nbsp;miles? A vetted courier puts
            it in their hands, or a neighborhood shop holds it for pickup. And if you like,
            your name stays a secret until the box is open.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={site.appStoreUrl} className={buttonVariants({ size: "lg" })}>
              <HugeiconsIcon icon={AppleIcon} strokeWidth={2} />
              Get the app
            </a>
            <a href="#pricing" className={buttonVariants({ size: "lg", variant: "paper" })}>
              Estimate my delivery
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
