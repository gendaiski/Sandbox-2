import Image from "next/image"
import type { IconSvgElement } from "@hugeicons/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar03Icon,
  DashboardSquare01Icon,
  DeliveryTruck01Icon,
  GiftCardIcon,
  Location01Icon,
  ShoppingBasket01Icon,
  StoreLocation01Icon,
  Tag01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"

import { Mark } from "@/components/brand/logo"
import { Barcode } from "@/components/colis/barcode"
import { Postmark, Stamp, Tape } from "@/components/colis/stamp"
import { cn } from "@/lib/utils"

/* ——— Un rayon en ligne : le bon de commande qui sort de l'imprimante ——— */

const exampleOrder = [
  { name: "Tea and candle box", meta: "By hand · 3:00 PM", status: "To wrap" },
  { name: "$40 gift card", meta: "Sent by text", status: "Paid" },
  { name: "45-min massage", meta: "Thursday, 6:15 PM", status: "Booked" },
]

export function PartnerOnline() {
  return (
    <section aria-labelledby="online-title" className="relative pb-24 lg:pb-32">
      <div className="mx-auto grid max-w-[86rem] grid-cols-[minmax(0,1fr)] items-center gap-x-10 gap-y-14 px-4 sm:px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-6">
          <h2 id="online-title" className="type-title text-[clamp(3.25rem,9vw,6.5rem)] text-ink">
            A shelf online, no website to build.
          </h2>
          <p className="mt-7 max-w-[42ch] text-[1.125rem] leading-[1.6] lg:text-[1.1875rem]">
            Your products and open time slots go straight into the app, right where locals
            look for something to give.
          </p>
          <p className="mt-4 max-w-[42ch] text-[1.125rem] leading-[1.6] text-ink-soft">
            In Ficelle Pro, on your phone or your laptop, you watch the orders, bookings and
            payouts come in.
          </p>
        </div>

        {/* Bon de commande d'exemple, à la sortie de l'imprimante à tickets */}
        <div className="relative lg:col-span-5 lg:col-start-8">
          <div aria-hidden="true" className="relative mx-auto max-w-[25rem]">
            <div className="relative z-10 -mx-2 h-5 rounded-[3px] bg-ink shadow-[0_3px_0_#000] sm:-mx-4" />
            {/* Le bon sort de l'imprimante quand il arrive à l'écran */}
            <div data-reveal="print" className="zigzag relative mx-auto -mt-2 w-[calc(100%-1.5rem)] -rotate-[1deg] bg-paper px-6 pt-8 pb-9 font-mono text-[0.875rem] leading-[1.6] text-ink drop-shadow-[0_14px_12px_rgb(60_38_12/0.35)] [--s:8px]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold tracking-[0.18em] uppercase">
                  <Mark className="w-7" />
                  Ficelle
                </span>
                <span className="text-[0.75rem] uppercase">Sample</span>
              </div>
              <p className="mt-3 text-[0.8125rem]">Today’s orders · 3</p>
              <p className="my-3 overflow-hidden whitespace-nowrap text-ink/50">{"- ".repeat(40)}</p>
              <ul className="space-y-3">
                {exampleOrder.map((order) => (
                  <li key={order.name} className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block font-semibold">{order.name}</span>
                      <span className="block text-[0.8125rem] text-ink-soft">{order.meta}</span>
                    </span>
                    <span className="shrink-0 border-[1.5px] border-ink px-1.5 text-[0.75rem] uppercase">
                      {order.status}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="my-3 overflow-hidden whitespace-nowrap text-ink/50">{"- ".repeat(40)}</p>
              <p className="text-[0.8125rem]">Courier pickup scheduled for 3:00 PM.</p>
              <Barcode value="FICELLE-PRO" className="mt-5 h-10" />
            </div>
            <Stamp r={-12} reveal={1000} className="absolute right-0 -bottom-6 z-20 text-[1.6rem] sm:-right-8">
              Courier
              <br />
              on the way
            </Stamp>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ——— Les outils du comptoir : une planche d'étiquettes autocollantes ——— */

const features: { icon: IconSvgElement; title: string; text: string }[] = [
  {
    icon: ShoppingBasket01Icon,
    title: "Your shelf in the app",
    text: "Photos, prices and descriptions live in an afternoon, with no website to keep up.",
  },
  {
    icon: Calendar03Icon,
    title: "Bookable calendar",
    text: "Treatments and classes book by the hour, and your schedule fills itself.",
  },
  {
    icon: DeliveryTruck01Icon,
    title: "Couriers included",
    text: "We pick the package up at your counter and take it to the customer, by hand or via drop-off. You wrap, Ficelle rolls.",
  },
  {
    icon: Wallet01Icon,
    title: "Regular payouts",
    text: "Your sales, minus the 4%, land in your bank account with no invoice to chase.",
  },
  {
    icon: StoreLocation01Icon,
    title: "Drop-off spot",
    text: "Hold parcels for the neighborhood: $1.25 per pickup, plus extra foot traffic.",
  },
  {
    icon: GiftCardIcon,
    title: "Gift cards",
    text: "An amount good at your store only, which customers can send in seconds.",
  },
  {
    icon: Tag01Icon,
    title: "Sorted by occasion",
    text: "Celebrate, well done, sorry, get well soon: your products show up at the right time.",
  },
  {
    icon: DashboardSquare01Icon,
    title: "Dashboard",
    text: "Monthly sales, best sellers, customer reviews: it all fits on one screen.",
  },
]

export function PartnerFeatures() {
  return (
    <section aria-labelledby="features-title" className="relative pb-24 lg:pb-32">
      <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="features-title" className="type-title text-[clamp(3.25rem,9vw,6.5rem)] text-ink lg:col-span-7">
            Sell without leaving the counter.
          </h2>
          <p className="max-w-[42ch] text-[1.125rem] leading-[1.55] lg:col-span-5 lg:pb-3">
            Specialty food, flowers, spa days, jewelry, books, home decor or wine: if it
            makes a good gift, it has a spot on the shelf.
          </p>
        </div>

        {/* Planche d'étiquettes : support glacé, étiquettes prédécoupées */}
        <div className="relative mt-14 rounded-[6px] bg-[linear-gradient(125deg,#fdfbf4_0%,#efeadb_38%,#fbf8ef_52%,#ebe5d4_100%)] p-3 shadow-[0_18px_30px_-16px_rgb(60_38_12/0.6)] sm:p-5 lg:mt-16 lg:-rotate-[0.4deg]">
          <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {features.map((feature, i) => (
              <li
                key={feature.title}
                className={cn(
                  "relative flex flex-col rounded-[10px] bg-paper p-5 lg:min-h-[13.5rem] shadow-[0_0_0_1px_rgb(15_35_36/0.12),0_1px_2px_rgb(15_35_36/0.12)] sm:p-6",
                  // la dernière étiquette commence à se décoller
                  i === features.length - 1 &&
                    "[clip-path:polygon(0_0,100%_0,100%_calc(100%-2.6rem),calc(100%-2.6rem)_100%,0_100%)] after:absolute after:right-0 after:bottom-0 after:size-[2.6rem] after:bg-[linear-gradient(135deg,#d9d2bf_0%,#f4f0e4_48%,transparent_50%)] after:shadow-[-2px_-2px_4px_rgb(15_35_36/0.12)]"
                )}
              >
                <HugeiconsIcon icon={feature.icon} strokeWidth={1.7} className="size-8 text-teal" />
                <h3 className="type-heading mt-5 text-[1.625rem]">{feature.title}</h3>
                <p className="mt-2 text-[1rem] leading-[1.5] text-ink-soft">{feature.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ——— Née à Bellmere : carte postale (recto photo, verso mot de la fondatrice) ——— */

const partners = [
  { name: "Opaline", kind: "Beauty bar, nails and massage", place: "Tanners Quay, Bellmere" },
  { name: "Maison Sauge", kind: "Beauty salon, by appointment", place: "Corbin Falls" },
]

export function PartnerLocal() {
  return (
    <section aria-labelledby="local-title" className="relative pb-24 lg:pb-32">
      <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2 id="local-title" className="type-title text-[clamp(3.25rem,9vw,6.5rem)] text-ink lg:col-span-8">
            Born in Bellmere, built for Bellmere.
          </h2>
          <p className="max-w-[40ch] text-[1.125rem] leading-[1.55] lg:col-span-4 lg:pb-3">
            Ficelle only delivers here, on purpose: one town, 15 miles of countryside around
            it, and shop owners we know by their first names.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:mt-16 lg:grid-cols-2 lg:gap-0">
          {/* Recto */}
          <figure className="relative bg-paper p-3 shadow-[0_18px_30px_-16px_rgb(60_38_12/0.6)] lg:-rotate-[2deg]">
            <div className="relative aspect-[3/2] overflow-hidden">
              <Image
                src="/images/quai.jpg"
                alt="The Tansy River on a fall morning: moored boats, cobblestones and tall plane trees"
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="flex items-baseline gap-3 px-1 pt-3 pb-1 text-[0.9375rem]">
              <span className="type-heading text-[1.375rem]">Bellmere</span>
              <span className="text-ink-soft">along the Tansy River</span>
            </figcaption>
          </figure>

          {/* Verso : le mot de la fondatrice */}
          <figure
            aria-label="A note from the founder"
            className="relative z-10 grid bg-paper p-6 shadow-[0_18px_30px_-16px_rgb(60_38_12/0.6)] sm:grid-cols-[1.35fr_1fr] sm:p-8 lg:mt-14 lg:-ml-10 lg:rotate-[1.5deg]"
          >
            <blockquote className="pb-6 text-[1.3125rem] leading-[1.55] text-ink italic [font-stretch:92%] sm:border-r sm:border-ink/25 sm:pr-7 sm:pb-0">
              <p>
                “I read every sign-up slip myself and call everyone back, usually within three
                business days. Ficelle exists so Bellmere’s storefronts can travel a little
                farther than their own sidewalk.”
              </p>
              <figcaption className="mt-5 text-[1rem] not-italic [font-stretch:100%]">
                <span className="font-bold">Inès Morvan</span>, founder of Ficelle
              </figcaption>
            </blockquote>
            <div className="relative flex flex-col border-t border-ink/25 pt-6 sm:border-t-0 sm:pt-0 sm:pl-7">
              <div aria-hidden="true" className="flex items-start justify-between">
                <Postmark className="w-36 sm:w-40" r={-6} waves={false} style={{ width: "6.5rem" }} />
                <div className="postage w-[4.5rem] rotate-[3deg] bg-paper drop-shadow-[0_1px_2px_rgb(60_38_12/0.4)]">
                  <div className="grid aspect-[4/5] place-items-center bg-teal-deep">
                    <Mark className="w-10" tone="cream" />
                  </div>
                </div>
              </div>
              <div className="mt-auto space-y-3 pt-8 font-mono text-[0.875rem]">
                <p className="border-b border-dotted border-ink/50 pb-1">To the shop</p>
                <p className="border-b border-dotted border-ink/50 pb-1">around the corner</p>
                <p className="border-b border-dotted border-ink/50 pb-1">Bellmere, OR 00000</p>
              </div>
            </div>
          </figure>
        </div>

        {/* Déjà sur l'étagère */}
        <div className="mt-16 lg:mt-20">
          <h3 className="type-heading text-[1.75rem]">Already on the shelf</h3>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:max-w-[52rem]">
            {partners.map((partner, i) => (
              <li
                key={partner.name}
                className={cn(
                  "tape-lift relative border-[1.5px] border-ink bg-paper shadow-[0_12px_20px_-12px_rgb(60_38_12/0.55)]",
                  i === 0 ? "-rotate-[1deg]" : "rotate-[1.2deg]"
                )}
              >
                <Tape r={i === 0 ? -6 : 5} className="-top-3 left-1/2 w-20 -translate-x-1/2" />
                <div className="flex items-center justify-between border-b-[1.5px] border-ink px-4 py-2">
                  <span className="type-field text-ink/70">Sender</span>
                  <span className="type-field text-ink/70">Ficelle</span>
                </div>
                <div className="px-4 py-4">
                  <p className="type-title text-[2.25rem]">{partner.name}</p>
                  <p className="mt-1 text-[1rem] text-ink-soft">{partner.kind}</p>
                  <p className="mt-3 flex items-center gap-1.5 font-mono text-[0.875rem]">
                    <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} className="size-4 text-teal" />
                    {partner.place}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

/* ——— Trois coupons à détacher : les étapes ——— */

const steps = [
  { title: "The sign-up slip", text: "Five short sections, done before your coffee cools." },
  { title: "A call from the founder", text: "Within 3 business days, to get to know you." },
  {
    title: "Your shelf goes live",
    text: "The first orders can come in as soon as the next day.",
  },
]

export function PartnerSteps() {
  return (
    <ol className="grid drop-shadow-[0_12px_14px_rgb(60_38_12/0.35)] md:grid-cols-3">
      {steps.map((step, i) => (
        <li
          key={step.title}
          className={cn(
            "relative flex gap-4 bg-paper px-6 py-6",
            // perforations entre les coupons
            i > 0 &&
              "border-t-2 border-dashed border-ink/35 md:border-t-0 md:border-l-2",
            "[mask:radial-gradient(circle_9px_at_0_50%,#0000_98%,#000)_,radial-gradient(circle_9px_at_100%_50%,#0000_98%,#000)] [mask-composite:intersect] md:[mask:radial-gradient(circle_9px_at_50%_0,#0000_98%,#000)_,radial-gradient(circle_9px_at_50%_100%,#0000_98%,#000)]"
          )}
        >
          <span aria-hidden="true" className="type-display text-[3.5rem] leading-[0.8] text-teal">
            {i + 1}
          </span>
          <div>
            <p className="type-heading text-[1.375rem]">{step.title}</p>
            <p className="mt-1.5 text-[1rem] leading-[1.5] text-ink-soft">{step.text}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
