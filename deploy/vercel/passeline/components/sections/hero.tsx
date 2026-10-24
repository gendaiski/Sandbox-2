import { AppleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { CityPanorama } from "@/components/illustrations/panorama"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="sky-morning relative flex min-h-svh flex-col overflow-hidden"
    >
      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-4 pt-[6.25rem] sm:px-6 md:pt-[6.9rem] lg:px-8">
        <h1
          id="hero-title"
          className="t-display max-w-[11.5ch] text-[clamp(3.5rem,6.6vw,6.75rem)] text-ink"
        >
          From your hands to theirs.
        </h1>
        <p className="t-lead mt-5 max-w-[37rem] text-ink-soft max-sm:text-[1.0625rem]">
          A cargo-bike courier carries your gift across Wrenhaven, or a neighbor
          down the street keeps it safe until it’s picked up. Anywhere in town,
          and up to 12 miles out.
        </p>
        <div className="mt-7 flex flex-wrap items-start gap-x-3 gap-y-2.5">
          <a
            href={site.appStoreUrl}
            className={buttonVariants({
              size: "lg",
              className: "max-sm:h-12 max-sm:px-5",
            })}
          >
            <HugeiconsIcon icon={AppleIcon} strokeWidth={1.8} />
            Get the app
          </a>
          <a
            href="#how-it-works"
            className={buttonVariants({
              variant: "light",
              size: "lg",
              className: "max-sm:h-12 max-sm:px-5",
            })}
          >
            Follow the trip
          </a>
        </div>
      </div>
      <div aria-hidden="true" className="min-h-6 flex-1" />
      <div className="relative aspect-[640/580] w-full md:-mt-[8vw] md:aspect-[1600/580]">
        <CityPanorama
          className="absolute inset-0 h-full w-full"
          label="Wrenhaven in the morning: the Orrin River, the streetcar on the quay, the town hall and its clock, limestone storefronts and the Ferris wheel. On the quay, a gift tied with a gold bow is ready to go."
        />
      </div>
    </section>
  )
}
