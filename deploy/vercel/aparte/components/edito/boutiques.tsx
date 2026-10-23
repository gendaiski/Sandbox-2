import Link from "next/link"

import { Caption, Container, Photo, RunningHead } from "@/components/edito/primitives"
import { CarteCadeau } from "@/components/edito/visuels"
import bouquet from "@/public/images/produit-bouquet.jpg"
import the from "@/public/images/produit-the.jpg"

const carnet = [
  {
    name: "Maison Ambre",
    place: "Washerwomen’s Quay, Larch Harbor",
    text: "Nails, express facials and massage, right on the river.",
  },
  {
    name: "Institut Céladon",
    place: "Orcel Point",
    text: "Face and body treatments, with time slots you book online.",
  },
  {
    name: "La Maison Aparté",
    place: "In the app",
    text: "Our gift boxes, wrapping papers and cards to write on.",
  },
] as const

const occasions = [
  "To say thanks.",
  "To celebrate.",
  "To apologize.",
  "To cheer on.",
  "No reason at all.",
] as const

export function Boutiques() {
  return (
    <section
      id="shops"
      aria-labelledby="shops-title"
      className="scroll-mt-6 pb-24 lg:pb-36"
    >
      <Container>
        <RunningHead label="The shops" folio={5} />

        <div className="mt-12 grid grid-cols-12 gap-x-4 lg:mt-16 lg:gap-x-6">
          <h2
            id="shops-title"
            className="display col-span-12 text-[3.25rem] text-balance sm:text-[4.5rem] lg:col-span-8 lg:text-[6.5rem]"
          >
            The address book
          </h2>
          <p className="col-span-12 mt-6 max-w-[40ch] text-[1.0625rem] leading-[1.7] lg:col-span-5 lg:mt-8 lg:text-[1.125rem]">
            Larch Harbor’s shopkeepers each have a page in the app: something
            to send, a treatment to give, a gift card to tuck into your note.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-12 gap-x-4 gap-y-14 lg:mt-20 lg:gap-x-6">
          <figure className="col-span-12 lg:col-span-6">
            <CarteCadeau className="aspect-[901/470] w-full max-w-[680px]" />
            <Caption className="mt-3">
              A gift card from Institut Céladon in Orcel Point. It travels with
              your note, and the treatment is booked later in the app.
            </Caption>
          </figure>

          <ul
            data-reveal="leaders"
            className="col-span-12 lg:col-span-5 lg:col-start-8"
          >
            {carnet.map((shop, i) => (
              <li
                key={shop.name}
                className="border-t border-gold/70 py-6 first:pt-5 last:pb-0"
                style={{ "--i": i } as React.CSSProperties}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
                  <h3 className="display shrink-0 text-[2.125rem] leading-none lg:text-[2.5rem]">
                    {shop.name}
                  </h3>
                  <span
                    aria-hidden="true"
                    data-leader
                    className="min-w-4 flex-1 translate-y-[-0.3em] border-b border-dotted border-gold"
                  />
                  <span
                    data-leader-label
                    className="ml-auto shrink-0 text-right text-[0.8125rem] text-ink-soft italic"
                  >
                    {shop.place}
                  </span>
                </div>
                <p className="mt-2.5 text-[0.9375rem] leading-[1.6] text-ink-soft">
                  {shop.text}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-20 grid grid-cols-12 gap-x-4 gap-y-12 lg:mt-28 lg:gap-x-6">
          <div className="col-span-12 lg:col-span-5">
            <p className="text-[0.9375rem] leading-[1.6] text-ink-soft">
              Or start from what you want to say:
            </p>
            <ul data-reveal="lines" className="mt-4">
              {occasions.map((o, i) => (
                <li
                  key={o}
                  className="display text-[2.5rem] leading-[1.08] italic sm:text-[3rem] lg:text-[3.5rem]"
                >
                  <span
                    className="reveal-line"
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <span>{o}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <figure className="col-span-12 lg:col-span-6 lg:col-start-7 lg:self-end">
            <div className="grid grid-cols-2 gap-4 sm:max-w-[34rem] lg:gap-6">
              <Photo
                zoom
                src={bouquet}
                alt="Pink peonies and eucalyptus wrapped in brown kraft paper."
                sizes="(min-width: 1024px) 260px, 45vw"
                position="50% 100%"
                crop={1}
                className="aspect-[4/5] w-full"
              />
              <Photo
                zoom
                src={the}
                alt="Pale green tea in a white porcelain cup, resting in soft window light."
                sizes="(min-width: 1024px) 260px, 45vw"
                position="50% 55%"
                crop={1}
                className="aspect-[4/5] w-full lg:mt-16"
              />
            </div>
            <Caption className="mt-3 sm:max-w-[34rem]">
              A fresh bouquet, a rare tea, a spa treatment: browse from one shop
              to the next, or start from the occasion.
            </Caption>
          </figure>
        </div>

        <p className="mt-16 border-t border-gold/70 pt-5 text-[0.9375rem] leading-[1.6] lg:mt-24">
          Think your shop belongs in this book?{" "}
          <Link href="/for-merchants" className="link-edito">
            Tell us about&nbsp;it
          </Link>
        </p>
      </Container>
    </section>
  )
}
