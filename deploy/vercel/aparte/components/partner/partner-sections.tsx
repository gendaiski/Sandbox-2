import Link from "next/link"

import {
  Caption,
  Container,
  Photo,
  RunningHead,
} from "@/components/edito/primitives"
import { Vitrine } from "@/components/edito/visuels"
import { BoutiquePreview } from "@/components/partner/boutique-preview"
import { PartnerForm } from "@/components/partner/partner-form"
import { buttonVariants } from "@/components/ui/button"
import { site } from "@/lib/site"
import quai from "@/public/images/quai.jpg"

/* ——— Couverture du numéro spécial ——— */

export function PartnerCover() {
  return (
    <section aria-labelledby="merchants-title" className="pb-16 lg:pb-20">
      <Container>
        <div className="flex items-baseline justify-between gap-6 border-t border-gold/70 pt-3 text-[0.8125rem] leading-none text-ink-soft">
          <span>Special issue: merchants</span>
          <span className="hidden sm:inline">Larch Harbor and nearby</span>
        </div>

        {/*
          Vitrine en haut, titre dessous qui remonte de 0,45 em sur le seuil
          de pierre (zone claire) : l'encre reste lisible à toutes les tailles.
          Ordre de lecture : titre, chapô, photo.
        */}
        <div className="@container mt-8 flex flex-col lg:mt-12 xl:grid xl:grid-cols-12 xl:gap-x-6">
          <h1
            id="merchants-title"
            className="cover-title-block display relative z-10 order-2 -mt-[0.45em] max-w-[11em] text-[14.5cqw] text-balance sm:text-[10.5cqw] lg:max-w-none lg:text-[8.6cqw] xl:col-span-12 xl:row-start-2 xl:text-[7.6cqw]"
          >
            Make your shop the gift people give.
          </h1>

          <div className="order-3 mt-10 max-w-[30rem] xl:col-span-4 xl:row-start-1 xl:mt-0 xl:self-start">
            <p className="serif text-[1.5rem] leading-[1.2] italic lg:text-[1.75rem]">
              Around here, people open Aparté before they push open a shop
              door.
            </p>
            <p className="mt-5 text-[1rem] leading-[1.65] text-ink-soft">
              Your products photographed by our team, your treatments
              bookable, your sales carried by our couriers. All that’s left
              is wrapping the package.
            </p>
            <div className="mt-8 flex flex-col items-start gap-4">
              <a className={buttonVariants({ size: "lg" })} href="#form">
                Apply now
              </a>
              <p className="text-[0.875rem] text-ink-soft">
                Already listed?{" "}
                <a href={site.proUrl} className="link-edito">
                  Merchant portal
                </a>
              </p>
            </div>
          </div>

          <figure className="cover-reveal order-1 -mx-5 sm:-mx-8 md:mx-0 xl:col-span-8 xl:col-start-5 xl:row-start-1">
            <figcaption className="mb-2 px-5 text-right text-[0.78125rem] leading-[1.45] text-ink-soft italic sm:px-8 md:px-0">
              On the cover: the window of Maison Ambre, a beauty bar on
              Washerwomen’s Quay in Larch Harbor and an Aparté partner.
            </figcaption>
            <Vitrine className="aspect-[4/3] w-full sm:aspect-[901/470]" />
          </figure>
        </div>

        {/* En bref : les trois atouts */}
        <ul className="mt-16 grid gap-8 md:grid-cols-3 md:gap-0 lg:mt-24">
          {[
            {
              title: "6% per sale",
              text: "Aparté only earns on what you actually sell in the app.",
            },
            {
              title: "Photos on us",
              text: "When you join, our team comes by to photograph your products.",
            },
            {
              title: "30 days’ notice",
              text: "Leave whenever you decide. Just give us a month’s heads-up.",
            },
          ].map((item, i) => (
            <li
              key={item.title}
              className={
                i === 0
                  ? "border-t border-gold/70 pt-5 md:pr-8"
                  : "border-t border-gold/70 pt-5 md:border-l md:pl-8 md:pr-8"
              }
            >
              <p className="display text-[2rem] lg:text-[2.5rem]">
                {item.title}
              </p>
              <p className="mt-3 text-[0.9375rem] leading-[1.6] text-ink-soft">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

/* ——— Au sommaire : les huit fonctionnalités ——— */

const features = [
  {
    title: "Pro product photos",
    text: "Our team stops by to shoot your products, and you approve each listing before it goes live.",
  },
  {
    title: "Online booking",
    text: "Customers book a treatment or a workshop at a time that works for them, no phone tag.",
  },
  {
    title: "Aparté couriers",
    text: "A courier picks up the package at your counter and carries it to the lucky recipient, note included.",
  },
  {
    title: "Regular payouts",
    text: "Your sales land in your bank account, minus our 6% share, with no invoices to chase.",
  },
  {
    title: "Loyalty",
    text: "Every purchase adds up in the customer’s account, and they can watch their reward get closer.",
  },
  {
    title: "Gift cards",
    text: "An amount to spend at your shop only, tucked into the note the courier reads.",
  },
  {
    title: "Customer messages",
    text: "A new arrival, a closure, a private sale: give your regulars a heads-up by text.",
  },
  {
    title: "Aparté Pro",
    text: "Today’s sales, your bookings and your reviews, all on a single screen.",
  },
] as const

export function PartnerSommaire() {
  return (
    <section
      id="features"
      aria-labelledby="features-title"
      className="scroll-mt-6 pb-24 lg:pb-36"
    >
      <Container>
        <RunningHead label="In this issue" folio={2} />

        <div className="mt-12 grid grid-cols-12 gap-x-4 gap-y-14 lg:mt-16 lg:gap-x-6">
          <div className="col-span-12 lg:col-span-5">
            <h2
              id="features-title"
              className="display text-[3.25rem] text-balance sm:text-[4.5rem] lg:text-[5.25rem]"
            >
              A shop window in the app, nothing to build.
            </h2>
            <p className="mt-8 max-w-[38ch] text-[1.0625rem] leading-[1.7]">
              Your page brings together your products, treatments and gift
              cards, right where Larch Harbor plans its gifts. Flowers, sweets,
              beauty, jewelry, books or clothing: every kind of Main Street
              shop has a place here.
            </p>
            <p className="mt-4 max-w-[38ch] text-[1.0625rem] leading-[1.7] text-ink-soft">
              Track sales, bookings and payouts in the Aparté Pro app or from
              your{" "}
              <a href={site.proUrl} className="link-edito">
                merchant&nbsp;portal
              </a>
              .
            </p>

            {/* Maquette HTML de l’app : nette même au zoom */}
            <figure className="mt-12 flex items-end gap-5">
              <div className="w-[9.5rem] shrink-0 overflow-hidden rounded-[1.25rem] border border-ink/15 bg-white p-1.5 shadow-[0_24px_40px_-26px_rgb(15_35_36/0.45)]">
                <BoutiquePreview />
              </div>
              <Caption className="max-w-[16rem] pb-1">
                Institut Céladon in the app: give a gift card, or book a time
                slot.
              </Caption>
            </figure>
          </div>

          <ol
            data-reveal="numerals"
            className="col-span-12 border-t border-gold/70 lg:col-span-6 lg:col-start-7"
          >
            {features.map((feature, i) => (
              <li
                key={feature.title}
                className="grid grid-cols-[2.75rem_1fr] gap-x-4 border-b border-ink/10 py-5 sm:grid-cols-[3.5rem_1fr]"
              >
                <span
                  aria-hidden="true"
                  className="reveal-line display pt-0.5 text-[2rem] text-gold-ink italic tabular-nums"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span>{i + 1}</span>
                </span>
                <div>
                  <h3 className="display text-[1.75rem] leading-[1.05] lg:text-[2rem]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 max-w-[46ch] text-[0.9375rem] leading-[1.6] text-ink-soft">
                    {feature.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  )
}

/* ——— Le voisinage, et les boutiques déjà présentes ——— */

const partners = [
  {
    name: "Maison Ambre",
    place: "Washerwomen’s Quay, Larch Harbor",
    text: "Nails, express facials and massage, right on the river.",
  },
  {
    name: "Institut Céladon",
    place: "Orcel Point",
    text: "Facials, with time slots you book online.",
  },
] as const

export function PartnerLarchHarbor() {
  return (
    <section
      aria-labelledby="neighbors-title"
      className="pt-16 pb-24 lg:pt-24 lg:pb-36"
    >
      <Container>
        <RunningHead label="Larch Harbor" folio={4} />

        <div className="mt-12 grid grid-cols-12 gap-x-4 gap-y-12 lg:mt-16 lg:gap-x-6">
          <figure className="col-span-12 lg:col-span-6">
            <Photo
              src={quai}
              alt="Sailboats and waterfront houses reflected in Flensburg harbor at dusk."
              sizes="(min-width: 1024px) 46vw, 100vw"
              crop={1}
              position="50% 50%"
              zoom
              className="aspect-[4/3] w-full max-w-[42rem]"
            />
            <Caption className="mt-3">
              Waterfront inspiration for our fictional town: Flensburg, photographed by Carsten Ruthemann.
            </Caption>
          </figure>

          <div className="col-span-12 lg:col-span-5 lg:col-start-8">
            <h2
              id="neighbors-title"
              className="display text-[3rem] text-balance sm:text-[4rem] lg:text-[4.25rem]"
            >
              A neighborhood thing, nothing more.
            </h2>
            <p className="mt-8 max-w-[38ch] text-[1.0625rem] leading-[1.7]">
              Aparté isn’t chasing the whole country or the big chains. We work
              with shops in Larch Harbor and the towns around it, and nobody
              else.
            </p>

            <p className="serif mt-12 text-[1.25rem] italic">Already on board</p>
            <ul data-reveal="leaders" className="mt-3">
              {partners.map((shop, i) => (
                <li
                  key={shop.name}
                  className="border-t border-gold/70 py-5 last:border-b"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="display shrink-0 text-[2rem] leading-none">
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
                  <p className="mt-2 text-[0.9375rem] text-ink-soft">
                    {shop.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  )
}

/* ——— Candidature : les trois étapes, puis le bulletin ——— */

const steps = [
  {
    title: "You fill out the form",
    text: "A handful of questions about your shop and about you.",
  },
  {
    title: "Clémence calls you",
    text: "Within five business days, to get to know you.",
  },
  {
    title: "We photograph your products",
    text: "Then your page goes live in the app, ready to sell.",
  },
] as const

export function PartnerCandidature() {
  return (
    <section
      id="form"
      aria-labelledby="form-title"
      className="scroll-mt-6 pb-24 lg:pb-36"
    >
      <Container>
        <RunningHead label="Apply" folio={5} />

        <div className="mt-12 grid grid-cols-12 gap-x-4 gap-y-10 lg:mt-16 lg:gap-x-6">
          <div className="col-span-12 lg:col-span-5">
            <h2
              id="form-title"
              className="display text-[3.25rem] text-balance sm:text-[4.5rem] lg:text-[5.25rem]"
            >
              Get into the book.
            </h2>
            <p className="mt-8 max-w-[36ch] text-[1.0625rem] leading-[1.7]">
              Five short steps is all it takes. Clémence Varenne reads every
              application and calls you back within five business days.
            </p>
          </div>

          <ol
            aria-label="What happens next"
            data-reveal="numerals"
            className="col-span-12 self-end border-t border-gold/70 lg:col-span-6 lg:col-start-7"
          >
            {steps.map((step, i) => (
              <li
                key={step.title}
                className="grid grid-cols-[2.75rem_1fr] gap-x-4 border-b border-ink/10 py-4 sm:grid-cols-[3.5rem_1fr]"
              >
                <span
                  aria-hidden="true"
                  className="reveal-line display text-[1.75rem] text-gold-ink italic"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span>{i + 1}</span>
                </span>
                <div>
                  <p className="text-[1rem] font-medium">{step.title}</p>
                  <p className="mt-1 text-[0.9375rem] text-ink-soft">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-14 lg:mt-20">
          <PartnerForm />
        </div>

        <p className="mt-8 text-[0.875rem] text-ink-soft">
          Not sure yet? Take a look at the{" "}
          <Link href="/faq" className="link-edito">
            FAQ
          </Link>
          , or ask us at{" "}
          <a href={`mailto:${site.email}`} className="link-edito">
            {site.email}
          </a>
          .
        </p>
      </Container>
    </section>
  )
}
