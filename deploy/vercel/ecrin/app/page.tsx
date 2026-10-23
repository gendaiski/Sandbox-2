import { Composer } from "@/components/composer"
import { OpeningScene } from "@/components/opening-scene"
import {
  FaqSection,
  FinalSection,
  ModesSection,
  NetworkSection,
} from "@/components/sections"
import { ShopsMarquee } from "@/components/shops-marquee"

export default function Page() {
  return (
    <>
      <OpeningScene />

      <section
        id="pricing"
        aria-labelledby="pricing-title"
        className="relative scroll-mt-8 px-(--gutter) py-24 md:py-36"
      >
        <div className="mx-auto max-w-[78rem]">
          <div className="mx-auto max-w-[44rem] text-center">
            <h2 id="pricing-title" className="heading">
              Set up your delivery
            </h2>
            <p className="lead mt-6">
              Three settings is all it takes. The preview shows what your
              recipient will experience, and what the trip will cost.
            </p>
          </div>
          <div className="mt-14 md:mt-20">
            <Composer />
          </div>
        </div>
      </section>

      <ModesSection />

      <section
        id="shops"
        aria-labelledby="shops-title"
        className="relative scroll-mt-8 overflow-hidden py-24 md:py-32"
      >
        <div className="mb-14 px-(--gutter) md:mb-20">
          <div className="mx-auto grid max-w-[78rem] gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
            <h2 id="shops-title" className="heading">
              Gifts made in Vantry
            </h2>
            <p className="lead max-w-[34rem]">
              Local workshops and shops show off their pieces in the app.
              Browse by neighborhood or by feeling, from “Love you” to
              “Just because.”
            </p>
          </div>
        </div>
        <ShopsMarquee />
      </section>

      <NetworkSection />
      <FaqSection />
      <FinalSection />
    </>
  )
}
